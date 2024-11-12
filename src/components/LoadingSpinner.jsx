import { PuffLoader } from "react-spinners";

function LoadingSpinner({ size, extraClasses }) {
  return (
    <div className={`flex justify-center items-center ${extraClasses}`}>
      <PuffLoader color="#ffffff" size={size} speedMultiplier={0.7} />
    </div>
  );
}

export default LoadingSpinner;
