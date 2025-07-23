import React from "react";
import { ShieldX, ArrowLeft, Home, AlertTriangle } from "lucide-react";

const UnauthorizedPage: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon with animated background */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ShieldX className="w-10 h-10 text-red-500" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-red-200 rounded-full mx-auto animate-ping opacity-20"></div>
        </div>

        {/* Main heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>

        {/* Subheading */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>

        {/* Warning info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm text-amber-800 font-medium">
              Insufficient Permissions
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Your current role doesn't include access to this resource.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Return Home</span>
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-6">
          Error Code: 403 - Forbidden
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
