"use client";
// components/EIP3DGraphWrapper.tsx


import dynamic from 'next/dynamic';

const EIP3DGraph = dynamic(() => import('./NetworkUpgradesGraph'), { ssr: false });

export default EIP3DGraph;
