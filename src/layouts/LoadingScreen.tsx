const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <style>{`
        @keyframes slowPulse {
          0%, 100% { 
            transform: scale(0.2);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes breathe {
          0%, 100% { 
            transform: scale(0.3);
            opacity: 0.7;
          }
          50% { 
            transform: scale(1.4);
            opacity: 1;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        
        @keyframes ripple2 {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(3.2);
            opacity: 0;
          }
        }
        
        @keyframes ripple3 {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .slow-pulse {
          animation: slowPulse 3s ease-in-out infinite;
        }
        
        .breathe {
          animation: breathe 2.5s ease-in-out infinite;
        }
        
        .ripple-1 {
          animation: ripple 3s ease-out infinite;
        }
        
        .ripple-2 {
          animation: ripple2 3s ease-out infinite 0.6s;
        }
        
        .ripple-3 {
          animation: ripple3 3s ease-out infinite 1.2s;
        }
      `}</style>

      <div className="relative">
        {/* Main pulsating circle */}
        <div className="w-20 h-20 bg-indigo-500 rounded-full breathe shadow-lg"></div>

        {/* Multiple ripple rings with staggered timing */}
        <div className="absolute inset-0 w-20 h-20 bg-indigo-300 rounded-full ripple-1 opacity-40"></div>
        <div className="absolute inset-0 w-20 h-20 bg-indigo-400 rounded-full ripple-2 opacity-30"></div>
        <div className="absolute inset-0 w-20 h-20 bg-indigo-200 rounded-full ripple-3 opacity-20"></div>

        {/* Inner core */}
        <div className="absolute inset-3 w-14 h-14 bg-indigo-600 rounded-full slow-pulse opacity-90"></div>
      </div>

      {/* Loading text with slower pulse */}
      {/* <div className="absolute bottom-1/3 text-indigo-600 text-lg font-medium slow-pulse">
        Loading...
      </div> */}
    </div>
  );
};

export default LoadingScreen;
