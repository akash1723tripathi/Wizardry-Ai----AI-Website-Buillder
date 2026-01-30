import React from 'react';

const RainbowButton = ({ children, onClick, className = "", ...props }) => {
      return (
            <>
                  <style>{`
        @keyframes rotate {
                    100% {
                        transform: rotate(1turn);
                    }
                }
            
                .rainbow::before {
                    content: '';
                    position: absolute;
                    z-index: -2;
                    left: -50%;
                    top: -50%;
                    width: 200%;
                    height: 200%;
                    background-position: 100% 50%;
                    background-repeat: no-repeat;
                    background-size: 50% 30%;
                    filter: blur(6px);
                    background-image: linear-gradient(#FFF);
                    animation: rotate 4s linear infinite;
                }
      `}</style>

                  {/* 1. We pass 'className' to the outer wrapper so you can add margins/positioning from outside.
        2. We wrap the onClick in the div or button depending on preference, but usually the button handles the click.
      */}
                  <div className={`rainbow relative z-0 bg-white/15 overflow-hidden p-0.5 flex items-center justify-center rounded-full hover:scale-105 transition duration-300 active:scale-100 ${className}`}>
                        <button
                              onClick={onClick}
                              {...props} // Passes down other props like disabled, type="submit", etc.
                              className="px-6 text-sm py-3 text-white rounded-full font-medium bg-gray-900/80 backdrop-blur w-full h-full"
                        >
                              {children}
                        </button>
                  </div>
            </>
      );
};

export default RainbowButton;