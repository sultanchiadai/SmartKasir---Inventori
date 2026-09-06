import React, { useState } from 'react';
import { ShoppingCart, Package, Plus, Trash2, Search, AlertTriangle, CheckCircle } from 'lucide-react';

// Sample Initial Data
const INITIAL_PRODUCTS = [
  { id: 1, name: 'Kopi Susu Gula Aren', price: 18000, stock: 15, minStock: 5, category: 'Minuman' },
  { id: 2, name: 'Roti Bakar Cokelat', price: 15000, stock: 3, minStock: 5, category: 'Makanan' },
  { id: 3, name: 'Es Teh Manis', price: 5000, stock: 25, minStock: 10, category: 'Minuman' },
  { id: 4, name: 'Indomie Goreng + Telur', price: 12000, stock: 2, minStock: 5, category: 'Makanan' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'inventory'
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // New Product Form State
  const [newProd, setNewProd] = useState({ name: '', price: '', stock: '', minStock: '', category: 'Makanan' });

  // POS Handlers
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQty = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          const product = products.find((p) => p.id === id);
          if (newQty <= 0) return null;
          if (newQty > product.stock) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Deduct stock in real-time
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);
        if (cartItem) {
          return { ...p, stock: p.stock - cartItem.qty };
        }
        return p;
      })
    );

    setCart([]);
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 3000);
  };

  // Inventory Handlers
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.stock) return;

    const item = {
      id: Date.now(),
      name: newProd.name,
      price: Number(newProd.price),
      stock: Number(newProd.stock),
      minStock: Number(newProd.minStock) || 5,
      category: newProd.category,
    };

    setProducts([...products, item]);
    setNewProd({ name: '', price: '', stock: '', minStock: '', category: 'Makanan' });
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart size={24} /> SmartKasir & Inventaris
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'pos' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-500'
            }`}
          >
            Kasir (POS)
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'inventory' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-500'
            }`}
          >
            Stok Barang
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {paymentSuccess && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} /> Transaksi berhasil! Stok otomatis diperbarui.
          </div>
        )}

        {activeTab === 'pos' ? (
          /* ================= POS SECTION ================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= product.minStock;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`p-4 bg-white rounded-xl border shadow-sm transition cursor-pointer relative flex flex-col justify-between ${
                        isOutOfStock
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-blue-500 hover:shadow-md'
                      }`}
                    >
                      {isLowStock && !isOutOfStock && (
                        <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle size={12} /> Sisa {product.stock}
                        </span>
                      )}
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">
                          {product.category}
                        </span>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-blue-600 font-bold">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col h-[calc(100vh-160px)]">
              <h2 className="text-lg font-bold border-b pb-3 mb-4">Keranjang Belanja</h2>

              <div className="flex-1 overflow-y-auto space-y-3">
                {cart.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Keranjang masih kosong</p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <span className="text-xs text-gray-500">
                          Rp {item.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="px-2 py-0.5 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <span className="px-2 text-sm font-medium">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="px-2 py-0.5 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Total & Action */}
              <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>Total</span>
                  <span className="text-blue-600">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= INVENTORY SECTION ================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Product Form */}
            <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Plus size={20} /> Tambah Produk Baru
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
                    <input
                      type="number"
                      required
                      value={newProd.stock}
                      onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min. Stok</label>
                    <input
                      type="number"
                      value={newProd.minStock}
                      onChange={(e) => setNewProd({ ...newProd, minStock: e.target.value })}
                      className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Simpan Produk
                </button>
              </form>
            </div>

            {/* Inventory Table */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border shadow-sm overflow-hidden">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package size={20} /> Daftar Stok Barang
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-600 text-sm">
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Harga</th>
                      <th className="p-3">Stok</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm">
                    {products.map((p) => {
                      const isLow = p.stock <= p.minStock;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-gray-500">{p.category}</td>
                          <td className="p-3">Rp {p.price.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-bold">{p.stock}</td>
                          <td className="p-3">
                            {p.stock === 0 ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                Habis
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                Menipis
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                Aman
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}