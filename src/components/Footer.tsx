import React from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Linkedin, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-900 p-2.5 rounded-xl">
                <Microscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">PaperLenz</h3>
                <p className="text-sm text-gray-400">See Science Clearly</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering scientific understanding through AI-powered analysis. 
              Making complex research accessible to everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link to="/analyze" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Analyze Paper
              </Link>
              <Link to="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Connect</h4>
            <div className="flex items-center space-x-3">
              <a 
                href="https://www.linkedin.com/in/sathvigaabharathi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-lg hover:bg-amber-900 transition-colors group"
              >
                <Linkedin className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
              
              <a 
                href="https://github.com/SathvigaaBharathi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-600 transition-colors group"
              >
                <Github className="h-5 w-5 text-gray-400 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2025 PaperLenz. All rights reserved.
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500" />
            <span>for the scientific community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}