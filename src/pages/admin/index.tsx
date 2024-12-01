import { useState, useEffect } from 'react';
import * as tourismService from '@/libs/dabase';  // Pastikan nama file benar
import { useRouter } from 'next/router';

type Wisata = {
  id: string;
  nama: string;
  deskripsi: string;
  lokasi: string;
  harga: number;
  ketersediaan: boolean;
};

const AdminPage = () => {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tourismList, setTourismList] = useState<Wisata[]>([]);
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    location: '',  // Menambahkan properti lokasi
    price: '',
    availability: '', // Ketersediaan sebagai string, nanti kita akan mengonversinya ke boolean
  });

  const router = useRouter();

  useEffect(() => {
    // Check authorization
    fetch('/api/auth/admin', {
      headers: { role: 'admin' },
    })
      .then((res) => (res.status === 200 ? setAuthorized(true) : setAuthorized(false)))
      .catch(() => setAuthorized(false));

    // Load initial tourism data
    fetchTourism();
  }, []);

  const fetchTourism = async () => {
    try {
      const data = await tourismService.getTourism();
      setTourismList(data);
    } catch (error) {
      console.error('Error fetching tourism data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, name, description, location, price, availability } = form;

    if (!name || !description || !price || !availability) {
      alert('All fields are required.');
      return;
    }

    try {
      const parsedPrice = parseInt(price);
      const parsedAvailability = availability === 'true'; // Mengonversi ke boolean

      if (id) {
        await tourismService.updateTourism(id, {
          name,
          description,
          location,
          price: parsedPrice,
          availability: parsedAvailability,
        });
        alert('Tourism updated successfully!');
      } else {
        await tourismService.createTourism({
          name,
          description,
          location,
          price: parsedPrice,
          availability: parsedAvailability,
        });
        alert('Tourism added successfully!');
      }

      setForm({ id: '', name: '', description: '', location: '', price: '', availability: '' });
      fetchTourism();
    } catch (error) {
      console.error('Error saving tourism:', error);
    }
  };

  const handleEdit = (item: Wisata) => {
    setForm({
      id: item.id,
      name: item.nama,
      description: item.deskripsi,
      location: item.lokasi,
      price: item.harga.toString(),
      availability: item.ketersediaan ? 'true' : 'false',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tourism package?')) return;

    try {
      await tourismService.deleteTourism(id);
      alert('Tourism deleted successfully!');
      fetchTourism();
    } catch (error) {
      console.error('Error deleting tourism:', error);
    }
  };

  const createPayment = async (id: string, name: string, price: number) => {
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `order-${id}-${Date.now()}`,
          amount: price,
          customerName: 'Admin',
          email: 'admin@example.com',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment transaction');
      }

      const { redirect_url } = await response.json();
      window.open(redirect_url, '_blank');
    } catch (error) {
      console.error('Error creating payment transaction:', error);
    }
  };

  if (authorized === null) return <p>Loading...</p>;
  if (!authorized)
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You are not authorized to view this page.</p>
      </div>
    );

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Manage Tourism Packages</h2>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleInputChange}
          placeholder="Name"
          required
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
        />
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleInputChange}
          placeholder="Location"
          required
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleInputChange}
          placeholder="Price"
          required
        />
        <input
          type="text"
          name="availability"
          value={form.availability}
          onChange={handleInputChange}
          placeholder="Availability (true/false)"
          required
        />
        <button type="submit">{form.id ? 'Update' : 'Add'}</button>
      </form>

      {/* List */}
      <ul>
        {tourismList.map((item) => (
          <li key={item.id}>
            <p>
              <strong>{item.nama}</strong> - Rp {item.harga} ({item.ketersediaan ? 'Available' : 'Not Available'})
            </p>
            <p>Location: {item.lokasi}</p>
            <button onClick={() => handleEdit(item)}>Edit</button>
            <button onClick={() => handleDelete(item.id)}>Delete</button>
            <button onClick={() => createPayment(item.id, item.nama, item.harga)}>
              Generate Payment
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
