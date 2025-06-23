// icons/Joystick.tsx

/**
 * This project was developed by Nikandr Surkov.
 * 
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * GitHub: https://github.com/nikandr-surkov
 */

import { IconProps } from "../utils/types";

const Joystick: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    const svgSize = `${size}px`;

    return (
        <svg 
            className={className} 
            height={svgSize} 
            width={svgSize} 
            viewBox="0 0 40 32" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M20.5 6C19.1193 6 18 7.11929 18 8.5C18 9.88071 19.1193 11 20.5 11C21.8807 11 23 9.88071 23 8.5C23 7.11929 21.8807 6 20.5 6Z" fill="currentColor"/>
            <path d="M25 14H16C14.8954 14 14 14.8954 14 16V25C14 26.1046 14.8954 27 16 27H25C26.1046 27 27 26.1046 27 25V16C27 14.8954 26.1046 14 25 14Z" fill="currentColor"/>
            <path d="M12 18C10.8954 18 10 18.8954 10 20V25C10 26.1046 10.8954 27 12 27H13V18H12Z" fill="currentColor"/>
            <path d="M28 18H27V27H28C29.1046 27 30 26.1046 30 25V20C30 18.8954 29.1046 18 28 18Z" fill="currentColor"/>
            <path d="M20.5 12C20.7761 12 21 12.2239 21 12.5V15.5C21 15.7761 20.7761 16 20.5 16C20.2239 16 20 15.7761 20 15.5V12.5C20 12.2239 20.2239 12 20.5 12Z" fill="currentColor"/>
        </svg>
    );
};

export default Joystick;