import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                TI
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Textile<span className="text-blue-500">Intel</span> Platform
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Empowering circular fashion through AI-driven textile waste recognition, inventory analytics, and intelligent sorting pipelines.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition">
                  Platform Overview
                </Link>
              </li>
              <li>
                <Link to="/inventory" className="hover:text-white transition">
                  Inventory Management
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Enterprise Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Global Recycled Standard</span>
              </li>
              <li>
                <span className="text-slate-400">Circular Textile Standards</span>
              </li>
              <li>
                <span className="text-slate-400">Enterprise Data Governance</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AI Textile Waste Intelligence Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Production Grade Architecture • Built for Sustainability</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
