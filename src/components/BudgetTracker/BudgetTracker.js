// src/components/BudgetTracker.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BudgetTracker.css";
import Swal from "sweetalert2";

const BudgetTracker = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [importance, setImportance] = useState("1"); // Valor predeterminado
  const [validationTable, setValidationTable] = useState([]);

  useEffect(() => {
    fetchData();
    scheduleNotification();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/categories");
      setCategories(response.data);
      checkBudgetExpiry(response.data);
      updateValidationTable(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await axios.post("http://localhost:3001/categories", {
        name: newCategory,
        budget,
        importance,
      });
      setCategories([...categories, response.data]);
      checkBudgetExpiry([...categories, response.data]);
      updateValidationTable([...categories, response.data]);
      scheduleNotification();
    } catch (error) {
      console.error("Error adding category:", error.message);
    }

    setNewCategory("");
    setBudget("");
    setImportance("1"); // Reinicia a valor predeterminado después de agregar una categoría
  };

  const scheduleNotification = () => {
    setInterval(() => {
      fetchNotifications();
    }, 20000);
  };

  const checkBudgetExpiry = (categoriesToCheck) => {
    const currentDate = new Date();

    categoriesToCheck.forEach((category) => {
      const notificationDate = new Date();
      notificationDate.setSeconds(
        notificationDate.getSeconds() + category.importance * 20
      );

      if (currentDate > notificationDate) {
        showExpiryNotification(category.name);
      }
    });
  };

  const showExpiryNotification = (categoryName) => {
    Swal.fire({
      icon: "warning",
      title: "Presupuesto Próximo a Vencer",
      text: `El presupuesto para la categoría "${categoryName}" está próximo a vencer.`,
    });
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/simulate-early-notification"
      );
      const notifications = response.data;

      if (notifications.length > 0) {
        notifications.forEach((notification) => {
          showExpiryNotification(notification.categoryName);
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error fetching notifications:", error.message);
    }
  };

  const updateValidationTable = (categoriesToUpdate) => {
    const tableData = categoriesToUpdate.map((category) => ({
      id: category.id,
      name: category.name,
      budget: category.budget,
      importance: category.importance,
    }));

    setValidationTable(tableData);
  };

  return (
    <div className="container">
      <h1 className="header">Seguimiento de Presupuesto</h1>

      <div className="form-container">
        <label htmlFor="newCategory">Nueva Categoría:</label>
        <input
          type="text"
          id="newCategory"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        <label htmlFor="budget">Presupuesto:</label>
        <input
          type="text"
          id="budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <label>Importancia:</label>
        <div>
          <label>
            <input
              type="radio"
              value="1"
              checked={importance === "1"}
              onChange={() => setImportance("1")}
            />
            Baja
          </label>
          <label>
            <input
              type="radio"
              value="2"
              checked={importance === "2"}
              onChange={() => setImportance("2")}
            />
            Media
          </label>
          <label>
            <input
              type="radio"
              value="3"
              checked={importance === "3"}
              onChange={() => setImportance("3")}
            />
            Alta
          </label>
        </div>

        <button onClick={handleAddCategory}>Agregar Categoría</button>
      </div>

      <div className="validation-table">
        <h2>Tabla de Validación de Presupuestos</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Presupuesto</th>
              <th>Importancia</th>
            </tr>
          </thead>
          <tbody>
            {validationTable.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.budget}</td>
                <td>{category.importance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetTracker;
