// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import BuildingPage from '../pages/BuildingPage';
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo o nombre de la app */}
        <div className="mb-2 md:mb-0">
          <Link to="/" className="text-xl font-bold hover:underline">
            CompiTrueno
          </Link>
        </div>
        {/* Menú de navegación */}
        <nav className="flex space-x-4">
          <Link to="/about" className="hover:underline">
            About
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </nav>
        {/* Copyright */}
        <div className="mt-2 md:mt-0 text-sm">
          &copy; {new Date().getFullYear()} WikiHome. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
