export const useToast = () => {
  return (options: any) => {
    if (typeof window !== "undefined") {
      const title = options?.title ?? "Notification";
      const description = options?.description ? ` - ${options.description}` : "";
      console.log(`[toast] ${title}${description}`);
    }
  };
};
