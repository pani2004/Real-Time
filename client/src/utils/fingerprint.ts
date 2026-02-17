// Browser fingerprint utility for voter identification
// Anti-abuse mechanism #2: Prevents same browser from voting multiple times

export const getFingerprint = (): string => {
  const STORAGE_KEY = 'voter_fingerprint';
  
  let fingerprint = localStorage.getItem(STORAGE_KEY);
  
  if (!fingerprint) {
    // Generate a unique fingerprint using crypto.randomUUID
    fingerprint = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, fingerprint);
  }
  
  return fingerprint;
};
