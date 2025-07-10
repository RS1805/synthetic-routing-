# 🧠 Synthetic Routing

**Synthetic Routing** is a Python-based project designed to simulate and evaluate airline routing using real-world flight data. The goal is to optimize routing strategies by generating and testing synthetic itineraries based on distance, pricing, and airport metadata.

---

## ✈️ Features

- **Airport Metadata Processing**: Parses airport metadata from CSV files for location-based routing.
- **Distance Calculation**: Uses the Haversine formula to compute distances between airports.
- **Synthetic Route Generation**: Creates realistic synthetic flight routes based on origin-destination logic.
- **Data Storage**: Saves results in structured formats (CSV/JSON) for further analysis or visualization.

---

## 🗂️ Repository Structure

```
synthetic-routing/
├── airports.csv         # Metadata for global airports
├── main.py              # Main script to generate synthetic routes
├── utils.py             # Utility functions (e.g., distance calculation)
├── generated_routes.csv # Sample output
└── README.md            # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites

- Python 3.7+
- Install required libraries:

```bash
pip install -r requirements.txt
```

### Run the Project

```bash
python main.py
```

This will generate a CSV file containing synthetic routing data between airport pairs.

---

## 📊 Output Example

| Origin | Destination | Distance (km) | Duration (est) | Airline |
|--------|-------------|----------------|----------------|---------|
| JFK    | LAX         | 3974.34        | 6h 5m          | SyntheticAir |
| DEL    | DXB         | 2184.88        | 3h 45m         | FlySynth     |

---

## 📌 Use Cases

- Academic research in aviation and logistics
- Testing airline pricing algorithms
- Machine learning model training for route prediction
- Simulating synthetic travel scenarios

---

## 🤝 Contributing

We welcome contributions! If you'd like to suggest improvements, report bugs, or add features:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License – see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Made with ❤️ by [RS1805](https://github.com/RS1805)