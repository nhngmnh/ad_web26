// UpdateProduct.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AdminContext } from '../context/AdminContext';

const categories = ['Laptop', 'Smartphone', 'Smartwatch', 'Tablet', 'Accessory', 'PC, Printer'];

const UpdateProduct = () => {
  const navigate = useNavigate();
  const { backendurl, aToken } = useContext(AdminContext);
  const location = useLocation();
  const prId = location.state?.productId;

  const [formData, setFormData] = useState({
    productId: prId,
    name: '',
    category: '',
    brand: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
  });

  const [specifications, setSpecifications] = useState([]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${backendurl}/api/admin/get-product/${prId}`, {
          headers: { aToken },
        });
        const product = response.data.data;

        setFormData({
          productId: prId,
          name: product.name || '',
          category: product.category || '',
          brand: product.brand || '',
          description: product.description || '',
          price: product.price || '',
          stock_quantity: product.stock_quantity || '',
          image_url: product.image_url || '',
        });

        const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({
          key,
          value,
          isNew: false,
        }));
        setSpecifications(specs);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [prId, backendurl, aToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '', isNew: true }]);
  };

  const handleSpecKeyChange = (index, newKey) => {
    const updated = [...specifications];
    updated[index].key = newKey;
    setSpecifications(updated);
  };

  const handleSpecValueChange = (index, newValue) => {
    const updated = [...specifications];
    updated[index].value = newValue;
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    data.append('productId', prId);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const specObj = specifications.reduce((obj, item) => {
      if (item.key) obj[item.key] = item.value;
      return obj;
    }, {});
    data.append('specifications', JSON.stringify(specObj));

    if (image) {
      data.append('image', image);
    }

    try {
      await axios.post(`${backendurl}/api/admin/update-product`, data, {
        headers: { aToken },
      });
      toast.success('Product updated successfully!');
      navigate('/products-list');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update product');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading product data...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {[
          { label: 'Product Name', name: 'name', type: 'text' },
          { label: 'Brand', name: 'brand', type: 'text' },
          { label: 'Description', name: 'description', type: 'textarea' },
          { label: 'Price', name: 'price', type: 'number' },
          { label: 'Stock Quantity', name: 'stock_quantity', type: 'number' },
        ].map(({ label, name, type }) => (
          <div key={name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <label htmlFor={name} className="w-full sm:w-40 font-medium">{label}:</label>
            {type === 'textarea' ? (
              <textarea
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border rounded text-sm sm:text-base"
              />
            ) : (
              <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border rounded text-sm sm:text-base"
              />
            )}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label htmlFor="category" className="w-full sm:w-40 font-medium">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="flex-1 px-4 py-2 border rounded text-sm sm:text-base"
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="font-semibold">Specifications:</p>
          {specifications.map((spec, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Key"
                value={spec.key}
                disabled={!spec.isNew}
                onChange={(e) => handleSpecKeyChange(index, e.target.value)}
                className={`flex-1 px-2 py-1 border rounded text-sm ${spec.isNew ? '' : 'bg-gray-100 text-gray-500'}`}
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) => handleSpecValueChange(index, e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
              <button type="button" onClick={() => handleRemoveSpec(index)} className="text-red-500 hover:text-red-700 text-sm">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddSpec} className="text-blue-600 underline text-sm">
            + Add Specification
          </button>
        </div>

        {(imagePreview || formData.image_url) && (
          <div>
            <p className="font-semibold">Preview Image:</p>
            <img
              src={imagePreview || formData.image_url}
              alt="Preview"
              className="w-32 h-32 object-cover rounded border"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
          <label htmlFor="image" className="w-full sm:w-40 font-medium">Upload Image:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1 text-sm" />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm sm:text-base"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default UpdateProduct;