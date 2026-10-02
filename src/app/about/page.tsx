"use client";

import Link from "next/link";
import { ArrowLeft, Code, Briefcase, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }} className="flex flex-col">
      {/* -- Header ------------------------------------------------------- */}
      <header
        className="flex items-center justify-between px-8 py-4 bg-white"
        style={{ borderBottom: "1px solid var(--color-rule)" }}
      >
        <Link href="/">
          <span className="font-ui text-sm font-semibold tracking-wide text-gray-900">
            SECUREFLOW AI
          </span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Application
          </Button>
        </Link>
      </header>

      {/* -- Content -------------------------------------------------------- */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-sm p-10">
          <p className="font-technical text-xs tracking-widest text-gray-400 uppercase mb-8 text-center">
            About the Builder
          </p>
          
          <h1 className="text-2xl font-medium text-gray-900 mb-2 text-center">
            Rishvin Reddy
          </h1>
          <p className="font-ui text-sm text-gray-500 text-center mb-8">
            B.Tech Computer Science & Engineering
          </p>
          
          <div className="space-y-3 mb-10 font-ui text-sm text-gray-700">
            <div className="flex items-center border border-gray-100 bg-gray-50 p-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              Cybersecurity
            </div>
            <div className="flex items-center border border-gray-100 bg-gray-50 p-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              IoT
            </div>
            <div className="flex items-center border border-gray-100 bg-gray-50 p-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              Blockchain
            </div>
            <div className="flex items-center border border-gray-100 bg-gray-50 p-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
              Full-Stack Engineering
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 border-t border-gray-100 pt-8">
            <a href="https://github.com/RishvinReddy" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors flex flex-col items-center gap-2">
              <Code className="w-5 h-5" />
              <span className="font-technical text-[10px] uppercase">GitHub</span>
            </a>
            <a href="https://linkedin.com/in/rishvinreddy" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors flex flex-col items-center gap-2">
              <Briefcase className="w-5 h-5" />
              <span className="font-technical text-[10px] uppercase">LinkedIn</span>
            </a>
            <a href="https://rishvin.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-600 transition-colors flex flex-col items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="font-technical text-[10px] uppercase">Portfolio</span>
            </a>
          </div>
        </div>
      </main>
      
      {/* -- Footer --------------------------------------------------------- */}
      <footer className="p-6 text-center text-xs font-technical text-gray-400 tracking-widest uppercase">
        Built for Pixels to Products — Cloudinary AI Hackathon 2026
      </footer>
    </div>
  );
}
