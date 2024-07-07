import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { openDb, storeDataWithExpiry } from "../../utils/cacheStore/IndexedDB";
import Loading from "../UI/Loading";

interface Article {
  title: string;
  description: string;
  url: string;
}

interface ApiResponse {
  articles: Article[];
}

const SearchComponent: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const latestQueryRef = useRef<string>("");

  const fetchResults = useCallback(
    debounce(async (searchQuery: string, pageNum: number) => {
      if (searchQuery.length < 3) return;

      setLoading(true);
      latestQueryRef.current = searchQuery;

      try {
        const cachedResults = await getCachedResults(searchQuery, pageNum);
        if (cachedResults && searchQuery === latestQueryRef.current) {
          setResults(cachedResults);
          setLoading(false);
          console.log("Data fetched from cache");
          return;
        }

        const response = await axios.get<ApiResponse>(
          `https://gnews.io/api/v4/search`,
          {
            params: {
              q: searchQuery,
              page: pageNum,
              max: 5,
              apikey: process.env.REACT_APP_GNEWS_API_KEY,
            },
          }
        );
        const newResults = response.data.articles;
        if (newResults) {
          console.log("Data fetched from api");
        }

        await storeDataWithExpiry(`${searchQuery}-${pageNum}`, newResults);

        if (searchQuery === latestQueryRef.current) {
          setResults(newResults);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        if (searchQuery === latestQueryRef.current) {
          setLoading(false);
        }
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (query.length >= 3) {
      fetchResults(query, page);
    }
  }, [query, fetchResults, page]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
    setPage(1);
    await fetchResults(value, 1);
  };

  const getCachedResults = async (
    searchQuery: string,
    pageNum: number
  ): Promise<Article[] | undefined> => {
    try {
      const db = await openDb();
      const transaction = db.transaction(["cacheStore"], "readonly");
      const store = transaction.objectStore("cacheStore");

      const cacheKey = `${searchQuery}-${pageNum}`;
      const request = store.get(cacheKey);

      const cachedItem = await new Promise<any>((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = (error) => {
          reject(error);
        };
      });

      if (cachedItem && isCacheValid(cachedItem.expiry)) {
        return cachedItem.data;
      } else {
        return undefined;
      }
    } catch (error) {
      console.error("Error retrieving data from IndexedDB:", error);
      return undefined;
    }
  };

  const isCacheValid = (expiry: number): boolean => {
    const currentTime = Date.now();
    return currentTime < expiry;
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(query, nextPage);
  };

  return (
    <div className="w-[60vw]">
      <div className="border border-[#ddd] p-2 rounded-md mt-2 mx-auto">
        <input
          type="text"
          value={query}
          placeholder="Enter Keywords"
          className="outline-none w-full px-3 text-[#6750a4]"
          onChange={handleInputChange}
        />
      </div>
      <div className="mt-3">
        {results.map((result, index) => (
          <div
            className="p-2"
            style={{ boxShadow: "rgba(17, 17, 26, 0.1) 0px 1px 0px" }}
            key={index}
          >
            <div className="font-medium text-xl text-gray-700 ">
              {result.title}
            </div>
            <div className="text-sm text-gray-500">{result.description}</div>
          </div>
        ))}
      </div>
      {results.length === 0 && !loading && query.length === 0 && (
        <div className="flex items-center justify-center">
          <img
            src="/images/search_bg.png"
            alt="search"
            className="w-52 h-52 opacity-50"
          />
        </div>
      )}

      {results.length === 0 && !loading && query.length > 2 && (
        <>
          <div className="flex items-center justify-center">
            <img
              src="/images/search_bg.png"
              alt="search"
              className="w-52 h-52 opacity-50"
            />
          </div>
          <div className="text-sm font-medium text-gray-500 text-center mt-3">
            No Match Found! Try some other keyword
          </div>
        </>
      )}

      {loading && (
        <div className="loading">
          <Loading />
        </div>
      )}
      {results.length > 0 && (
        <div className="flex items-center justify-center my-3">
          <button
            className="px-3 py-2 text-white bg-[#6750a4] mx-auto rounded-md hover:bg-[#463082]"
            onClick={handleLoadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
