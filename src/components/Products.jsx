import React, { useEffect, useState } from "react";
import axios from "axios";
import Logo from "./assets/IMAGE.png";
import Phone from "./assets/Telephone.png";
import Laptop from "./assets/Laptop.png";
import "./Products.css";

const blank = {
  title: "",
  price: "",
  description: "",
  specs: "",
  image_url: ""
};

const API_URL = "http://localhost:3001";

function Products() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);

  // Загрузка
  useEffect(() => {
    axios.get(`${API_URL}/products`)
      .then(r => setItems(r.data))
      .catch(err => console.error("GET /products:", err));
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Добавить
  const addItem = async (e) => {
    e?.preventDefault?.();               // не перезагружать страницу, если кнопка в форме
    try {
      const payload = {
        ...form,
        price: form.price === "" ? null : Number(form.price)
      };
      const { data } = await axios.post(`${API_URL}/products`, payload);
      setItems(prev => [data, ...prev]);
      setForm(blank);
    } catch (err) {
      console.error("POST /products:", err);
    }
  };

  // Начать редактирование
  const startEdit = (id) => {
    setEditId(id);
    const p = items.find(x => x.id === id);
    if (p) {
      setForm({
        title: p.title ?? "",
        price: p.price == null ? "" : String(p.price),
        description: p.description ?? "",
        specs: p.specs ?? "",
        image_url: p.image_url ?? ""
      });
    }
    // Прокрутить к форме добавления/обновления
    document.getElementById("addBlock")?.scrollIntoView({ behavior: "smooth" });
  };

  // Обновить
  const saveEdit = async (e) => {
    e?.preventDefault?.();
    if (!editId) return;
    try {
      const payload = {
        ...form,
        price: form.price === "" ? null : Number(form.price)
      };
      const { data } = await axios.put(`${API_URL}/products/${editId}`, payload);
      setItems(prev => prev.map(i => i.id === editId ? data : i));
      setEditId(null);
      setForm(blank);
    } catch (err) {
      console.error("PUT /products/:id", err);
    }
  };

  // Удалить
  const removeItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      if (editId === id) {
        setEditId(null);
        setForm(blank);
      }
    } catch (err) {
      console.error("DELETE /products/:id", err);
    }
  };

  return (
    <>
      {/* ЛОГО */}
      <div className="logo">
        <img src={Logo} alt="CALIFORNIA" />
      </div>

      {/* ФОРМА ДОБАВЛЕНИЯ/ОБНОВЛЕНИЯ */}
      <div className="productWrapper" id="addBlock">
        <h1>{editId ? "Обновить товар" : "Добавить товар"}</h1>
        <form
          className="addProduct productBlock"
          onSubmit={editId ? saveEdit : addItem}
        >
          <div className="leftProductBlock PBPart">
            <article className="addProduct__blocks">
              <label>Название товара</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Товар 1"
              />
            </article>
            <article className="addProduct__blocks">
              <label>Стоимость товара</label>
              <input
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="1000"
                inputMode="decimal"
              />
            </article>
            <article className="addProduct__blocks productDescription">
              <label>Описание товара</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Краткое описание"
              />
            </article>
          </div>

          <div className="rightProductBlock PBPart">
            <article className="addProduct__blocks">
              <label>Характеристики товара</label>
              <input
                name="specs"
                value={form.specs}
                onChange={onChange}
                placeholder="Объем памяти: 1000"
              />
            </article>
            <article className="addProduct__blocks">
              <label>Фотография товара (URL)</label>
              <div className="productPhoto">
                <img src={form.image_url || Phone} alt="product" />
              </div>
              <input
                name="image_url"
                value={form.image_url}
                onChange={onChange}
                placeholder="https://.../image.png"
              />
              <div>
                <button type="submit">
                  {editId ? "Сохранить изменения" : "Добавить товар"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => { setEditId(null); setForm(blank); }}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </article>
          </div>
        </form>
      </div>

      {/* СПИСОК ТОВАРОВ */}
      <div className="productWrapper">
        <h1>Товары</h1>
        <div className="productsList">
          {items.map(p => (
            <article key={p.id} className="productsList__elementWrapper">
              <article className="productsList__element">
                <div className="PL__elementImg">
                  <img src={p.image_url || Laptop} alt={p.title} />
                </div>
                <div className="PL__elementInfo">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <label>
                    {p.price == null ? "—" : `$ ${Number(p.price).toFixed(2)} USD`}
                  </label>
                </div>
              </article>
              <div className="cardActions">
                <button type="button" onClick={() => startEdit(p.id)}>Ред.</button>
                <button type="button" onClick={() => removeItem(p.id)}>-</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;
