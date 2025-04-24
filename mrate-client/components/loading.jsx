const Loading = ({ message }) => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading {message}...</p>
      </div>
    </div>
  );
};

export default Loading;
