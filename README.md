# DeepSpaceAI

An innovative, AI-powered platform aimed at revolutionizing the detection and understanding of exoplanets by leveraging advanced machine learning techniques and data from NASA's TESS, Kepler, and K2 missions.


https://github.com/user-attachments/assets/52583c0d-c631-4f0a-b499-a3d08dcf59ca


## 🌌 Overview

DeepSpaceAI provides users with the ability to explore and analyze exoplanet data in a highly interactive and educational environment. By utilizing artificial intelligence, DeepSpaceAI can identify exoplanets from raw mission data with remarkable accuracy.

## ✨ Key Features

### 🔍 Exoplanet Detection
- **AI-Powered Analysis**: Advanced machine learning models trained on NASA mission data
- **Real-time Discovery Updates**: Stay current with the latest exoplanet discoveries
- **Interactive Visualization**: Explore star systems and planetary transits in real-time

### 🌟 Star System Exploration
- **Comprehensive Filtering**: Filter by star types (giant, small, rocky) and mission sources (Kepler, TESS, K2)
- **Detailed Information**: Access rich data about stars including mass, radius, temperature, and position
- **Transit Visualization**: Watch the classic dip in brightness during planetary transits

### 🤖 AI Model Training
- **Hyperparameter Tuning**: Adjust learning rates, batch sizes, and epochs to optimize performance
- **Performance Metrics**: Monitor training status and model improvements
- **Educational Insights**: Understand the AI process behind exoplanet detection

### 📊 Data Sources
- **NASA TESS Mission**: Transiting Exoplanet Survey Satellite data
- **Kepler Mission**: Legacy exoplanet discovery data
- **K2 Mission**: Extended Kepler mission observations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/DeepSpaceAI.git
cd DeepSpaceAI
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: Tailwind CSS with shadcn/ui
- **3D Graphics**: Three.js for space visualization
- **Data Processing**: Custom AI models for exoplanet detection
- **State Management**: Zustand for application state

## 📁 Project Structure

```
DeepSpaceAI/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── exoplanet-detection.tsx
│   ├── star-system.tsx
│   └── ...
├── data/                  # Static data files
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and stores
└── public/               # Static assets
```

## 🎯 Core Components

- **Exoplanet Detection**: AI-powered analysis of transit data
- **Star System Visualization**: Interactive 3D space exploration
- **Hyperparameter Tuning**: Model optimization interface
- **Real-time Updates**: Live discovery notifications
- **Educational Tools**: Learning resources and explanations

## 🧠 AI & Machine Learning

DeepSpaceAI uses key planetary parameters to train AI models:
- Orbital period
- Transit depth
- Transit duration
- Stellar properties (mass, radius, temperature)

These models can distinguish exoplanets from false positives with high accuracy, making the platform a valuable tool for both research and education.

## 🎓 Educational Value

DeepSpaceAI democratizes access to cutting-edge space research by:
- Making exoplanet discovery accessible to everyone
- Providing hands-on experience with AI in space science
- Offering interactive learning tools for students and educators
- Encouraging public participation in space exploration

## 🤝 Contributing

We welcome contributions from scientists, developers, educators, and space enthusiasts! Please see our contributing guidelines for more information.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing the TESS, Kepler, and K2 mission data
- The exoplanet research community for their groundbreaking work
- Open source contributors who make projects like this possible

## 📞 Contact

For questions, suggestions, or collaboration opportunities, please reach out through our GitHub issues or contact the development team.

---

**DeepSpaceAI** - Making space exploration accessible, educational, and impactful for everyone. 🌌✨
