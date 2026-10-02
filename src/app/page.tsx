"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon, Sparkles, Crop, Layers, Zap, Search, Layout, Settings2, SlidersHorizontal, Maximize, RotateCw, FlipHorizontal, Eye, Database, Globe, Filter, Maximize2, Cpu, Shield, User, Code, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const CAPABILITIES = [
  { icon: Sparkles, title: "AI Analysis", desc: "Understand uploaded media" },
  { icon: Crop, title: "Smart Crop", desc: "Content-aware cropping" },
  { icon: Layers, title: "Background Removal", desc: "Isolate subjects" },
  { icon: Zap, title: "Optimization", desc: "Automatic delivery optimization" },
  { icon: SlidersHorizontal, title: "Transform Studio", desc: "Apply transformations" },
  { icon: Search, title: "Smart Search", desc: "Find assets through metadata" },
];

const WORKSPACE_STEPS = [
  { id: "01", title: "Upload", desc: "Drop an image or video to begin the pipeline." },
  { id: "02", title: "Inspect", desc: "Review AI analysis, metadata, tags, and moderation." },
  { id: "03", title: "Process", desc: "Apply Smart Crop, Background Removal, and transformations." },
  { id: "04", title: "Optimize", desc: "Configure automatic format and quality settings." },
  { id: "05", title: "Save", desc: "Save the processed asset into the Media Library." },
];

const TRANSFORMATIONS = [
  { icon: Maximize2, title: "Resize" },
  { icon: Crop, title: "Crop" },
  { icon: Sparkles, title: "Smart Crop" },
  { icon: RotateCw, title: "Rotate" },
  { icon: FlipHorizontal, title: "Flip" },
  { icon: Database, title: "Format" },
  { icon: Zap, title: "Quality" },
  { icon: Filter, title: "Blur" },
  { icon: Eye, title: "Grayscale" },
  { icon: Settings2, title: "Enhance" },
  { icon: Layers, title: "Background Removal" },
  { icon: Layout, title: "Upscale" },
];

const TEAM_MEMBERS = [
  {
    initials: "RR",
    name: "Rishvin Reddy",
    roles: "Engineering · Cybersecurity · Cloud · Product",
    degree: "B.Tech CSE",
    linkedin: "https://www.linkedin.com/in/rishvinreddy/?isSelfProfile=false",
    portfolio: "https://rishvinreddy.vercel.app/",
    github: "https://github.com/RishvinReddy",
    email: "mailto:rishvinreddy@gmail.com"
  },
  {
    initials: "NY",
    name: "Navari Yashwanth Reddy",
    roles: "Engineering · Development · Product",
    degree: "B.Tech CSE",
    linkedin: "https://www.linkedin.com/in/navari-yashwanth-reddy-4a7065357/?isSelfProfile=true",
    portfolio: "https://navariyashwanthreddy.vercel.app/",
    github: "https://github.com/YashwanthNavari",
    email: "mailto:navariyashwanthreddy@gmail.com"
  },
  {
    initials: "PG",
    name: "Pocharam Gayathri",
    roles: "Engineering · Development · Research",
    degree: "B.Tech CSE",
    linkedin: "https://www.linkedin.com/in/gayathripocharam/",
    portfolio: "https://gayathripocharam.github.io/",
    github: "https://github.com/Gayathripocharam",
    email: "mailto:pocharamgayathri@gmail.com"
  },
  {
    initials: "GY",
    name: "Guggilla Yogamruth Reddy",
    roles: "Engineering · Development",
    degree: "B.Tech CSE",
    linkedin: "https://www.linkedin.com/in/guggilla-yogamruth-reddy-109033324/?isSelfProfile=false",
    portfolio: null,
    github: "https://github.com/YogamruthReddy",
    email: "mailto:guggilla.yogamruthreddy4422@gmail.com"
  }
];

export default function LandingPage() {
  const [activeWorkspaceStep, setActiveWorkspaceStep] = useState(0);

  return (
    <div style={{ backgroundColor: "var(--color-background)", minHeight: "100vh" }} className="overflow-hidden">

      {/* -- Header ------------------------------------------------------- */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-white/70"
        style={{ borderBottom: "1px solid var(--color-rule)" }}
      >
        <div className="flex flex-col">
          <span className="font-ui text-sm font-semibold tracking-wide text-gray-900">
            SECUREFLOW AI
          </span>
          <span className="font-technical text-[10px] tracking-widest text-gray-500 uppercase">
            Media Intelligence Platform
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-ui text-sm text-gray-600">
          <Link href="#workspace" className="hover:text-gray-900 transition-colors">Product</Link>
          <Link href="/dashboard/workspace" className="hover:text-gray-900 transition-colors">Workspace</Link>
          <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
          <Link href="#architecture" className="hover:text-gray-900 transition-colors">How It Works</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/evidence">
            <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-600 hover:text-gray-900">
              Library
            </Button>
          </Link>
          <Link href="/dashboard/workspace">
            <Button variant="primary" size="sm" className="bg-gray-900 text-white hover:bg-gray-800 rounded-none">
              Start Workspace <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* -- Hero ------------------------------------------------------------- */}
      <section className="px-8 pt-24 pb-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="font-technical text-xs tracking-widest text-gray-500 uppercase mb-6">
              Cloudinary-Powered Media Intelligence
            </p>
            <h1 className="text-5xl md:text-7xl font-editorial font-medium tracking-tight text-gray-900 leading-[0.95] mb-8">
              Turn raw media into<br />intelligent assets.
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed">
              Upload, analyze, transform, optimize and manage your media through one unified workspace.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
              <Link href="/dashboard/workspace">
                <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 rounded-none h-14 px-8 text-sm">
                  Open Media Workspace <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard/evidence">
                <Button variant="secondary" size="lg" className="rounded-none h-14 px-8 text-sm border-gray-300 text-gray-700 hover:bg-gray-50">
                  Explore Media Library
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap gap-4 text-xs font-technical text-gray-500 uppercase tracking-wider">
              <span>AI Analysis</span> • <span>Smart Crop</span> • <span>Background Removal</span> • <span>Optimization</span> • <span>Transformations</span> • <span>Search</span>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div
            className="bg-gray-50 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both"
            style={{ aspectRatio: '4/3' }}
          >
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center">
              <span className="font-technical text-[10px] uppercase tracking-widest text-gray-500">Media Workspace</span>
              <span className="font-technical text-[10px] uppercase tracking-widest text-gray-400">workspace.jpg</span>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 bg-gray-100 flex items-center justify-center border-r border-gray-200 p-8">
                <div className="w-full h-full border border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center text-gray-400 bg-white">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="font-ui text-xs">Image Preview</span>
                </div>
              </div>
              
              <div className="w-64 bg-white flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-technical text-[10px] tracking-widest text-gray-400 mb-3 uppercase">Intelligence</h3>
                  <div className="mb-4">
                    <span className="font-ui text-[10px] font-semibold text-gray-500 block mb-2">AI TAGS</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-ui text-gray-700 rounded-sm">Person</span>
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-ui text-gray-700 rounded-sm">Laptop</span>
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-ui text-gray-700 rounded-sm">Workspace</span>
                      <span className="px-2 py-1 bg-gray-100 text-[10px] font-ui text-gray-700 rounded-sm">Technology</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-ui text-[10px] font-semibold text-gray-500 block mb-1">CONTENT STATUS</span>
                    <span className="text-[11px] text-green-600 font-medium">Safe</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <h3 className="font-technical text-[10px] tracking-widest text-gray-400 mb-3 uppercase">Process</h3>
                  <div className="space-y-2">
                    {["Smart Crop", "Remove BG", "Optimize", "Transform"].map(action => (
                      <div key={action} className="text-xs font-ui text-gray-600 py-1.5 border-b border-gray-50 flex justify-between">
                        {action} <ArrowRight className="w-3 h-3 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Capability Strip ------------------------------------------------- */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-gray-200">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className="p-6 hover:bg-gray-50 transition-colors">
              <cap.icon className="w-5 h-5 text-gray-900 mb-4" />
              <h3 className="font-ui text-sm font-semibold text-gray-900 mb-1">{cap.title}</h3>
              <p className="font-ui text-xs text-gray-500 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -- Problem Section -------------------------------------------------- */}
      <section className="px-8 py-24 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="font-technical text-xs tracking-widest text-gray-500 uppercase mb-6">The Problem</p>
            <h2 className="text-4xl font-editorial font-medium text-gray-900 leading-tight mb-8">
              Media workflows<br />are fragmented.
            </h2>
            <div className="font-ui text-lg text-gray-600 space-y-2 leading-relaxed">
              <p>Upload in one place.</p>
              <p>Analyze somewhere else.</p>
              <p>Edit manually.</p>
              <p>Optimize later.</p>
              <p>Search through folders.</p>
              <p>Repeat.</p>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="flex flex-col items-center max-w-sm mx-auto w-full">
              {['UPLOAD', 'ANALYZE', 'EDIT', 'OPTIMIZE', 'STORE', 'SEARCH'].map((step, index, arr) => (
                <div key={step} className="flex flex-col items-center w-full">
                  <div className="w-full bg-white border border-gray-200 py-3 px-6 text-center shadow-sm">
                    <span className="font-technical text-sm tracking-widest text-gray-900">{step}</span>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="h-6 border-l border-gray-300 my-1 relative">
                      <ArrowRight className="w-3 h-3 absolute -bottom-1 -left-1.5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-8 text-center">
                <p className="font-ui text-sm text-gray-600 bg-gray-100 py-2 px-4 inline-block">
                  SecureFlow AI brings these steps into one workflow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Solution Section ------------------------------------------------- */}
      <section id="workspace" className="px-8 py-24 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-editorial font-medium text-gray-900 leading-tight mb-16 text-center">
            One workspace.<br />Every media operation.
          </h2>
          
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {WORKSPACE_STEPS.map((step, i) => (
              <button
                key={step.id}
                onClick={() => setActiveWorkspaceStep(i)}
                className={`px-6 py-3 border text-sm font-ui transition-colors rounded-none ${
                  activeWorkspaceStep === i 
                    ? 'border-gray-900 bg-gray-900 text-white' 
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="font-technical text-[10px] tracking-widest mr-2 opacity-70">{step.id}</span>
                {step.title}
              </button>
            ))}
          </div>
          
          <div className="bg-gray-50 border border-gray-200 p-8 min-h-[400px] flex items-center justify-center shadow-sm">
            <div
              key={activeWorkspaceStep}
              className="text-center max-w-xl animate-in fade-in zoom-in-95 duration-300"
            >
                <h3 className="text-2xl font-medium text-gray-900 mb-4">{WORKSPACE_STEPS[activeWorkspaceStep].title}</h3>
                <p className="text-gray-600 font-ui text-lg mb-8">{WORKSPACE_STEPS[activeWorkspaceStep].desc}</p>
                <div className="w-full max-w-md mx-auto aspect-video bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-12 h-12" />
                </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/dashboard/workspace">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 rounded-none h-12 px-8">
                Open Media Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* -- AI Intelligence -------------------------------------------------- */}
      <section id="features" className="px-8 py-24 bg-gray-900 text-white border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <p className="font-technical text-xs tracking-widest text-gray-400 uppercase mb-4 text-center">
            AI Intelligence
          </p>
          <h2 className="text-4xl font-editorial font-medium leading-tight mb-16 text-center max-w-2xl mx-auto">
            Understand every asset before you transform it.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 border border-gray-700 p-8">
              <Cpu className="w-6 h-6 text-gray-300 mb-6" />
              <h3 className="font-ui text-lg font-semibold mb-3">AI Auto-Tagging</h3>
              <p className="text-gray-400 font-ui text-sm mb-6 leading-relaxed">
                Automatically identify visual content and generate structured tags leveraging Cloudinary's AI categorization.
              </p>
              <div className="flex gap-2 flex-wrap mt-auto">
                {["Person", "Laptop", "Workspace"].map(t => (
                  <span key={t} className="px-2 py-1 bg-gray-800 border border-gray-700 text-xs font-technical text-gray-300 rounded-sm">{t}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 p-8">
              <Shield className="w-6 h-6 text-gray-300 mb-6" />
              <h3 className="font-ui text-lg font-semibold mb-3">Content Moderation</h3>
              <p className="text-gray-400 font-ui text-sm mb-6 leading-relaxed">
                Evaluate media for moderation status where the configured Cloudinary capability is available.
              </p>
              <div className="mt-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-technical text-gray-300 uppercase tracking-widest">Safe Content</span>
              </div>
            </div>
            
            <div className="bg-gray-800/50 border border-gray-700 p-8">
              <Database className="w-6 h-6 text-gray-300 mb-6" />
              <h3 className="font-ui text-lg font-semibold mb-3">Media Intelligence</h3>
              <p className="text-gray-400 font-ui text-sm mb-6 leading-relaxed">
                Combine metadata, dimensions, format, file size, tags and processing information in one consolidated view.
              </p>
              <div className="mt-auto">
                <span className="text-xs font-technical text-gray-400">JPEG • 1920×1280 • 2.4MB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Processing Showcase ----------------------------------------------- */}
      <section className="px-8 py-24 border-b border-gray-200 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-editorial font-medium text-gray-900 leading-tight mb-4">
              Transform media without<br />leaving the workflow.
            </h2>
            <p className="text-gray-600 font-ui text-lg">
              Content-aware operations powered by Cloudinary transformations.
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-none shadow-sm max-w-5xl mx-auto overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-center items-center bg-gray-100 relative">
                <span className="absolute top-4 left-4 font-technical text-[10px] tracking-widest text-gray-400 uppercase">Original</span>
                <div className="w-48 h-48 bg-gray-200 border border-gray-300 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center items-center bg-white relative">
                <span className="absolute top-4 left-4 font-technical text-[10px] tracking-widest text-gray-400 uppercase">Smart Crop Result</span>
                <div className="w-48 h-48 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                   <div className="w-32 h-32 bg-gray-200 border border-blue-400 flex items-center justify-center relative">
                     <div className="absolute top-0 right-0 p-1 bg-blue-400 text-white">
                       <Crop className="w-3 h-3" />
                     </div>
                     <ImageIcon className="w-6 h-6 text-gray-400" />
                   </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4 bg-white flex justify-between items-center text-xs font-technical text-gray-500 uppercase">
              <span>Gravity: AI (g_auto)</span>
              <span>Aspect: 1:1</span>
              <Link href="/dashboard/processing/smart-crop" className="text-blue-600 hover:underline">
                Open Smart Crop →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -- Transform Toolbox ------------------------------------------------ */}
      <section className="px-8 py-24 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-technical text-xs tracking-widest text-gray-500 uppercase mb-12 text-center">
            Transformation Toolbox
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-200 border border-gray-200">
            {TRANSFORMATIONS.map((tool, i) => (
              <Link key={i} href="/dashboard/workspace" className="bg-white p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors text-center h-full group">
                <tool.icon className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors mb-3" />
                <span className="font-ui text-xs font-medium text-gray-700">{tool.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* -- Library & Search ------------------------------------------------- */}
      <section className="px-8 py-24 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="border border-gray-200 p-10 bg-gray-50 flex flex-col items-start justify-center">
            <h2 className="text-3xl font-editorial font-medium text-gray-900 mb-4">
              Everything you process,<br />organized in one place.
            </h2>
            <p className="text-gray-600 font-ui mb-8">
              Processed assets are saved into the application's media library with their full metadata and AI tags attached.
            </p>
            <Link href="/dashboard/evidence">
              <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-none">
                Open Media Library <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          <div className="border border-gray-200 p-10 bg-white flex flex-col items-start justify-center shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-6 h-6 text-gray-900" />
              <h2 className="text-2xl font-medium text-gray-900">Smart Search</h2>
            </div>
            <div className="w-full mb-6">
              <div className="flex items-center border border-gray-300 p-3 bg-gray-50">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <span className="font-technical text-sm text-gray-600">laptop|</span>
              </div>
            </div>
            <div className="space-y-3 w-full mb-8">
              <div className="p-3 border border-gray-100 bg-gray-50 text-sm font-ui text-gray-700">Laptop Workspace</div>
              <div className="p-3 border border-gray-100 bg-gray-50 text-sm font-ui text-gray-700">Student Lab</div>
            </div>
            <Link href="/dashboard/search">
              <Button variant="secondary" className="rounded-none border-gray-300 text-gray-700">
                Open Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* -- Architecture Pipeline -------------------------------------------- */}
      <section id="architecture" className="px-8 py-24 border-b border-gray-200 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-editorial font-medium mb-16">A media pipeline designed around Cloudinary.</h2>
          
          {/* Custom SVG Architecture Diagram */}
          <div className="relative mx-auto max-w-2xl font-technical text-xs tracking-widest uppercase">
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 border border-gray-700 px-6 py-3 rounded-none text-gray-300">User Upload</div>
            </div>
            <div className="h-8 border-l border-gray-700 mx-auto w-px"></div>
            <div className="flex justify-center my-8">
              <div className="bg-blue-900/40 border border-blue-500/50 px-8 py-4 rounded-none text-blue-300 font-bold tracking-widest text-sm">
                CLOUDINARY INFRASTRUCTURE
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 my-8 relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-8 border-t border-gray-700"></div>
               <div className="absolute top-0 left-1/4 h-8 border-l border-gray-700"></div>
               <div className="absolute top-0 right-1/4 h-8 border-r border-gray-700"></div>
               
               <div className="bg-gray-800 border border-gray-700 px-6 py-4 mt-8 flex flex-col items-center">
                 <Sparkles className="w-5 h-5 mb-2 text-gray-400" />
                 AI ANALYSIS
               </div>
               <div className="bg-gray-800 border border-gray-700 px-6 py-4 mt-8 flex flex-col items-center">
                 <Zap className="w-5 h-5 mb-2 text-gray-400" />
                 MEDIA DELIVERY
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 my-8 p-6 border border-gray-800 bg-gray-900/50">
              <div className="text-center text-gray-500 mb-4 col-span-3">TRANSFORMATIONS</div>
              <div className="bg-gray-800 border border-gray-700 py-2">Smart Crop</div>
              <div className="bg-gray-800 border border-gray-700 py-2">Background</div>
              <div className="bg-gray-800 border border-gray-700 py-2">Optimization</div>
            </div>
            
            <div className="h-8 border-l border-gray-700 mx-auto w-px"></div>
            
            <div className="flex justify-center my-8">
              <div className="bg-gray-800 border border-gray-700 px-8 py-3 text-gray-300">
                Media Library & Search
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -- Cloudinary CTA --------------------------------------------------- */}
      <section className="px-8 py-16 border-b border-gray-200 bg-gray-50 text-center">
        <h2 className="font-technical text-sm tracking-widest text-gray-500 uppercase mb-4">Powered by Cloudinary</h2>
        <p className="text-gray-600 font-ui max-w-2xl mx-auto mb-6">
          Leveraging Cloudinary's media storage, image transformations, AI-powered analysis, content-aware cropping, background extraction, and automatic delivery optimization.
        </p>
      </section>

      {/* -- Team Section ------------------------------------------------------- */}
      <section className="px-8 py-24 border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-editorial font-medium text-gray-900 leading-tight mb-4">
              Meet the Team
            </h2>
            <p className="text-gray-600 font-ui text-lg max-w-2xl mx-auto">
              Built by Build Bros — a student engineering team focused on cybersecurity, cloud infrastructure, intelligent media processing, and product engineering.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member, i) => (
              <div key={i} className="group bg-white border border-gray-200 p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-card hover:-translate-y-1 relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-gray-400 -rotate-45" />
                </div>
                
                <div className="w-16 h-16 bg-gray-100 text-gray-900 flex items-center justify-center font-editorial text-xl font-medium mb-6 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                  {member.initials}
                </div>
                
                <h3 className="font-ui font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-xs font-ui text-gray-500 mb-4 h-8">{member.roles}</p>
                
                <div className="font-technical text-[10px] tracking-widest text-gray-400 uppercase mb-8">
                  {member.degree}
                </div>
                
                <div className="border-t border-gray-100 w-full pt-6 mt-auto">
                  <div className="flex items-center justify-center gap-4">
                    <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors" title="LinkedIn">
                      <User className="w-5 h-5" />
                    </a>
                    <a href={member.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors" title="GitHub">
                      <Code className="w-5 h-5" />
                    </a>
                    {member.portfolio && (
                      <a href={member.portfolio} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-green-600 transition-colors" title="Portfolio">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    <a href={member.email} className="text-gray-400 hover:text-red-500 transition-colors" title="Email">
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Final CTA -------------------------------------------------------- */}
      <section className="px-8 py-32 bg-white border-b border-gray-200 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl font-editorial font-medium text-gray-900 leading-tight mb-6">
            Your media workflow starts here.
          </h2>
          <p className="text-xl text-gray-600 font-ui mb-12">
            Upload an asset, inspect its intelligence, transform it, optimize it and save the result. No setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard/workspace">
              <Button size="xl" className="bg-gray-900 text-white hover:bg-gray-800 rounded-none h-14 px-10 text-base">
                Open Media Workspace
              </Button>
            </Link>
            <Link href="/dashboard/evidence">
              <Button variant="secondary" size="xl" className="rounded-none border-gray-300 text-gray-700 h-14 px-10 text-base">
                View Media Library
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* -- Footer ----------------------------------------------------------- */}
      <footer className="px-8 pt-20 pb-10 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16 border-b border-gray-200 pb-16">
          <div className="col-span-2 lg:col-span-2 pr-8">
            <span className="font-ui text-sm font-semibold tracking-wide text-gray-900 block mb-4">
              SECUREFLOW AI
            </span>
            <p className="text-sm text-gray-500 font-ui leading-relaxed max-w-xs">
              Media intelligence and processing powered by Cloudinary.
            </p>
          </div>
          
          <div>
            <span className="font-technical text-[10px] tracking-widest text-gray-400 uppercase block mb-6">Product</span>
            <ul className="space-y-4 font-ui text-sm text-gray-600">
              <li><Link href="/dashboard/workspace" className="hover:text-gray-900">Workspace</Link></li>
              <li><Link href="/dashboard/evidence" className="hover:text-gray-900">Media Library</Link></li>
              <li><Link href="/dashboard/search" className="hover:text-gray-900">Smart Search</Link></li>
              <li><Link href="/dashboard/pipeline" className="hover:text-gray-900">Transform Studio</Link></li>
            </ul>
          </div>
          
          <div>
            <span className="font-technical text-[10px] tracking-widest text-gray-400 uppercase block mb-6">Capabilities</span>
            <ul className="space-y-4 font-ui text-sm text-gray-600">
              <li>AI Analysis</li>
              <li>Smart Crop</li>
              <li>Background Removal</li>
              <li>Optimization</li>
              <li>Transformations</li>
            </ul>
          </div>
          
          <div>
            <span className="font-technical text-[10px] tracking-widest text-gray-400 uppercase block mb-6">Project</span>
            <ul className="space-y-4 font-ui text-sm text-gray-600">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-gray-900">GitHub</a></li>
              <li><Link href="/about" className="hover:text-gray-900">About the Builder</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 font-ui">
          <span>SecureFlow AI</span>
          <span>Built for Pixels to Products — Cloudinary AI Hackathon 2026</span>
        </div>
      </footer>
    </div>
  );
}
