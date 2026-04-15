type HeadersMap = Record<string, string>;

type LegacyReq = {
  method: string;
  url: string;
  headers: HeadersMap;
  query: Record<string, any>;
  body: any;
  cookies: Record<string, string>;
};

type LegacyRes = {
  statusCode: number;
  headers: HeadersMap;
  body: any;
  ended: boolean;
  status: (code: number) => LegacyRes;
  json: (payload: any) => LegacyRes;
  send: (payload: any) => LegacyRes;
  setHeader: (name: string, value: any) => LegacyRes;
  getHeader: (name: string) => string | undefined;
  writeHead: (code: number, headers?: Record<string, any>) => LegacyRes;
  end: (payload?: any) => LegacyRes;
  redirect: (url: string) => LegacyRes;
};

function makeRes(): LegacyRes {
  const res: LegacyRes = {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      if (!this.headers['content-type']) {
        this.headers['content-type'] = 'application/json';
      }
      this.body = JSON.stringify(payload);
      this.ended = true;
      return this;
    },
    send(payload) {
      if (typeof payload === 'object' && payload !== null && !(payload instanceof Uint8Array)) {
        return this.json(payload);
      }
      this.body = payload ?? '';
      this.ended = true;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value);
      return this;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
    writeHead(code, headers = {}) {
      this.statusCode = code;
      for (const [k, v] of Object.entries(headers)) {
        this.setHeader(k, v as any);
      }
      return this;
    },
    end(payload) {
      if (payload !== undefined) this.body = payload;
      this.ended = true;
      return this;
    },
    redirect(url) {
      this.statusCode = 302;
      this.setHeader('location', url);
      this.ended = true;
      return this;
    },
  };
  return res;
}

async function parseBody(request: Request): Promise<any> {
  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD') return undefined;

  const contentType = request.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      return await request.json();
    }
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      return Object.fromEntries(params.entries());
    }
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const out: Record<string, any> = {};
      for (const [k, v] of form.entries()) {
        out[k] = v;
      }
      return out;
    }
    const text = await request.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

function toHeadersObject(request: Request): HeadersMap {
  const out: HeadersMap = {};
  request.headers.forEach((v, k) => {
    out[k.toLowerCase()] = v;
  });
  return out;
}

function toCookieObject(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('cookie') || '';
  const out: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) out[key] = val;
    }
  }
  return out;
}

function toQuery(url: URL, params: Record<string, string | string[] | undefined>): Record<string, any> {
  const query: Record<string, any> = {};
  url.searchParams.forEach((v, k) => {
    if (query[k] === undefined) query[k] = v;
    else if (Array.isArray(query[k])) query[k].push(v);
    else query[k] = [query[k], v];
  });
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined) query[k] = v;
  }
  return query;
}

export async function runLegacyHandler(
  handler: any,
  request: Request,
  params: Record<string, string | string[] | undefined> = {}
): Promise<Response> {
  if (typeof handler !== 'function') {
    return new Response(JSON.stringify({ error: 'Legacy handler is not a function' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const req: LegacyReq = {
    method: request.method,
    url: url.pathname + url.search,
    headers: toHeadersObject(request),
    query: toQuery(url, params),
    body: await parseBody(request),
    cookies: toCookieObject(request),
  };

  const res = makeRes();

  try {
    const maybe = await handler(req as any, res as any);

    if (!res.ended && maybe !== undefined) {
      if (maybe instanceof Response) return maybe;
      if (typeof maybe === 'object') {
        res.json(maybe);
      } else {
        res.send(maybe);
      }
    }

    const body = res.body === undefined ? null : res.body;
    return new Response(body as any, {
      status: res.statusCode || 200,
      headers: res.headers,
    });
  } catch (error) {
    console.error('Legacy handler execution error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
