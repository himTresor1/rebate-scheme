import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface GreetingProps {
  name: string;
  className?: string;
}

export function Greeting({ name, className = '' }: GreetingProps) {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 17) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    };

    updateGreeting();
    // Update every minute to catch time changes
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`pt-8 ${className}`}
    >
      <h1 className="text-xl sm:text-2xl text-gray-900">
        {greeting}, <span className="text-[#023F40]">{name}</span>
      </h1>
    </motion.div>
  );
}