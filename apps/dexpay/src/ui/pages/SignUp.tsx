import { useState } from 'react';
import GasPreferenceModal from '../components/modals/GasPreferenceModal';

export default function SignUp() {
  const [showGasPreference, setShowGasPreference] = useState(false);
  
  // Your existing registration logic
  const handleRegistrationSuccess = () => {
    // ... your existing success handling
    setShowGasPreference(true);
  };

  return (
    <>
      {/* Your existing signup form */}
      
      <GasPreferenceModal
        open={showGasPreference}
        onClose={() => setShowGasPreference(false)}
      />
    </>
  );
} 