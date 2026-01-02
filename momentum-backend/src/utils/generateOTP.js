export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateOTPExpiry = (time) => {
  return new Date(Date.now() + time * 60 * 1000);
};
