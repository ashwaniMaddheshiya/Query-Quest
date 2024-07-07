const Home = () => {
  return (
    <div className="container mx-auto p-8">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
        <ul className="list-disc list-inside ml-4">
          <li className="mb-2">
            Welcome to our Optimized News Search Application.
          </li>
          <li className="mb-2">
            Click the search icon on the right side of the navbar.
          </li>
          <li className="mb-2">
            Enter at least three characters in the search box to find news
            articles related to your query.
          </li>
          <li className="mb-2">
            Use words like <strong>google</strong>,<strong>samsung</strong>,
            <strong>iphone</strong> etc.
          </li>
          <li>
            You can refresh the IndexedDB in storage of browser to see the
            stored data as well as console to see where eaxctly data is coming from.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Technology Stack and Features
        </h2>
        <ul className="list-disc list-inside ml-4">
          <li className="mb-2">
            <span className="font-semibold">Frontend:</span> React | Axios
          </li>
          <li className="mb-2">
            <span className="font-semibold">API:</span> News API
          </li>
          <li className="mb-2">
            <span className="font-semibold">Cache Management:</span> IndexedDB
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
