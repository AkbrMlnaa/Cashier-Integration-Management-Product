export const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="w-full p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm mb-3">
      {message}
    </div>
  );
};
