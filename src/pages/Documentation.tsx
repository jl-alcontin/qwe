import React from "react";
import { Link } from "react-router-dom";
import {
  Store,
  Book,
  FileText,
  Code,
  Terminal,
  Database,
  Shield,
  Settings,
  CreditCard,
} from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      title: "Getting Started",
      icon: Book,
      content: [
        { title: "Introduction", href: "#introduction" },
        { title: "Quick Start Guide", href: "#quick-start" },
      ],
    },
    {
      title: "Core Features",
      icon: FileText,
      content: [
        { title: "Inventory Management", href: "#inventory" },
        { title: "Sales Processing", href: "#sales" },
        { title: "Reports & Analytics", href: "#reports" },
        { title: "Staff Management", href: "#staff" },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      content: [
        { title: "Authentication", href: "#authentication" },
        { title: "Permissions", href: "#permissions" },
        { title: "Data Protection", href: "#data-protection" },
      ],
    },
  ];

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to={"/"} className="flex items-center">
              <Store className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                IREGO POS
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Sidebar Navigation */}
            <div className="col-span-12 md:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h2 className="text-lg font-semibold mb-4">Documentation</h2>
                <nav className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <div className="flex items-center space-x-2 text-gray-900 font-medium mb-2">
                        <section.icon className="h-5 w-5" />
                        <span>{section.title}</span>
                      </div>
                      <ul className="space-y-2 ml-7">
                        {section.content.map((item) => (
                          <li key={item.title}>
                            <a
                              href={item.href}
                              className="text-gray-600 hover:text-primary text-sm"
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-12 md:col-span-9">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <section id="introduction" className="mb-12">
                  <h1 className="text-3xl font-bold mb-6">
                    IREGO POS Documentation
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Welcome to the comprehensive documentation for IREGO POS
                    System. This guide will help you understand and utilize all
                    the features of our point of sale system effectively.
                  </p>
                </section>

                <section id="quick-start" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Quick Start Guide
                  </h2>
                  <div className="prose max-w-none">
                    <p>Follow these steps to get started with IREGO POS:</p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>
                        Create an account and choose your subscription plan
                      </li>
                      <li>Set up your store profile and preferences</li>
                      <li>Add your inventory items</li>
                      <li>Configure user roles and permissions</li>
                      <li>Start processing sales</li>
                    </ol>
                  </div>
                </section>

                <section id="inventory" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Inventory Management
                  </h2>
                  <div className="flex items-center mb-4">
                    <Database className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Key Features</span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Real-time stock tracking</li>
                    <li>Automatic stock alerts</li>
                    <li>Batch inventory updates</li>
                    <li>Category management</li>
                    <li>Stock movement history</li>
                  </ul>
                </section>

                <section id="sales" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Sales Processing
                  </h2>
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Payment Methods</span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Cash transactions</li>
                    <li>Credit/Debit cards</li>
                    <li>QR code payments</li>
                    <li>Digital wallets</li>
                  </ul>
                </section>

                <section id="security" className="mb-12">
                  <h2 className="text-2xl font-semibold mb-4">
                    Security Features
                  </h2>
                  <div className="flex items-center mb-4">
                    <Shield className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">Security Measures</span>
                  </div>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Role-based access control</li>
                    <li>Two-factor authentication</li>
                    <li>Encrypted data transmission</li>
                    <li>Regular security audits</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Documentation;
