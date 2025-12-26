import React, { Fragment, useContext, useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct } from "../../admin/products/FetchApi";
import DualRangeSlider from "../../ui/DualRangeSlider";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const CategoryList = () => {
  const history = useHistory();
  const { data } = useContext(HomeContext);
  const [categories, setCategories] = useState(null);
  const [allCategories, setAllCategories] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
        setAllCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategorySearch = (e) => {
    const value = e.target.value;
    setCategorySearch(value);
    
    if (value.trim() === "") {
      setCategories(allCategories);
    } else {
      const filtered = allCategories.filter((cat) =>
        cat.cName.toUpperCase().includes(value.trim().toUpperCase())
      );
      setCategories(filtered);
    }
  };

  return (
    <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="py-4">
        <input
          value={categorySearch}
          onChange={handleCategorySearch}
          className="w-full px-4 py-3 focus:outline-none border border-gray-200 rounded"
          type="text"
          placeholder="Search categories..."
        />
      </div>
      <div className="py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories && categories.length > 0 ? (
          categories.map((item, index) => {
            return (
              <Fragment key={index}>
                <div
                  onClick={(e) =>
                    history.push(`/products/category/${item._id}`)
                  }
                  className="col-span-1 m-2 flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <img
                    src={`${apiURL}/uploads/categories/${item.cImage}`}
                    alt="pic"
                  />
                  <div className="font-medium">{item.cName}</div>
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="text-xl text-center my-4">No Category</div>
        )}
      </div>
    </div>
  );
};

const CombinedSearchFilter = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [sliderValues, setSliderValues] = useState([0, 1000]);
  const [productArray, setProductArray] = useState(null);

  const ensureProducts = useCallback(async () => {
    if (productArray) return productArray;
    dispatch({ type: "loading", payload: true });
    try {
      const responseData = await getAllProduct();
      const products = responseData && responseData.Products ? responseData.Products : [];
      setProductArray(products);
      dispatch({ type: "loading", payload: false });
      return products;
    } catch (error) {
      console.log(error);
      dispatch({ type: "loading", payload: false });
      return [];
    }
  }, [dispatch, productArray]);

  const applyFilters = useCallback(async (overrides = {}) => {
    const products = await ensureProducts();
    const search = overrides.search ?? searchQuery;
    const priceRange = overrides.priceRange ?? sliderValues;
    const [min, max] = priceRange;

    const filtered = products.filter((item) => {
      // Search in both title AND description
      const searchableText = `${item.pName || ""} ${item.pDescription || ""}`.toUpperCase();
      const searchMatch =
        search.trim() === "" ||
        searchableText.includes(search.trim().toUpperCase());
      
      // Price range filter
      const price = parseFloat(item.pPrice);
      const priceOk = !Number.isNaN(price) && price >= min && price <= max;
      
      return searchMatch && priceOk;
    });

    dispatch({ type: "setProducts", payload: filtered });
  }, [ensureProducts, searchQuery, sliderValues, dispatch]);

  useEffect(() => {
    if (data.searchFilterDropdown) {
      ensureProducts().then((products) => {
        dispatch({ type: "setProducts", payload: products });
      });
    }
  }, [data.searchFilterDropdown, ensureProducts, dispatch]);

  const closePanel = async () => {
    const products = await ensureProducts();
    dispatch({ type: "setProducts", payload: products });
    setSearchQuery("");
    setSliderValues([0, 1000]);
    dispatch({ type: "searchFilterDropdown", payload: false });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    applyFilters({ search: value });
  };

  const handleValueChange = (newValues) => {
    setSliderValues(newValues);
    applyFilters({ priceRange: newValues });
  };

  return (
    <div className={`${data.searchFilterDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-medium">Search &amp; Filter</div>
          <div onClick={closePanel} className="cursor-pointer">
            <svg
              className="w-8 h-8 text-gray-700 hover:bg-gray-200 rounded-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Search products</label>
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-3 focus:outline-none border border-gray-200 rounded"
            type="text"
            placeholder="Search by title or description"
          />
        </div>

        <div className="flex flex-col space-y-3">
          <label className="text-sm font-medium">
            Price range: <span className="font-semibold text-yellow-700">${sliderValues[0]}</span> - <span className="font-semibold text-yellow-700">${sliderValues[1]}</span>
          </label>
          <div className="pt-1 pb-2">
            <DualRangeSlider
              min={0}
              max={1000}
              step={10}
              value={sliderValues}
              onChange={handleValueChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <CombinedSearchFilter />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
