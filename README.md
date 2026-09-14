# 🌴 Vice Bay: GTA Open World 3D

A high-performance, 3D open-world GTA-style web game built with **Next.js**, **React Three Fiber (Three.js)**, and **Rapier Physics**.

---

## 🌟 Key Features

### 🏎️ High-Speed Driving & Realistic Vehicle Physics
- **135+ MPH Top Speed**: Accurate engine torque curve with punchy low-gear acceleration and smooth aerodynamic top-end pull.
- **Smooth Progressive Braking**: Hydraulic deceleration halts vehicles to a complete stop before shifting smoothly into Reverse (no jerky backward snapping).
- **Speed-Sensitive Steering & Drifting**: Stabilized high-speed cruising with responsive handbrake power slides (`[SPACE]`).
- **Dynamic Lighting**: Glowing red brake lights, directional headlights, and flashing police sirens.
- **Vehicle Fleet**: *Infernus GT* (Supercar), *Cheetah GTS*, *Banshee GT*, *Stallion Muscle*, *Sanchez Moto*, and *Police Interceptors*.

### 🌉 4-Lane Ocean Causeway & Expressway
- 270-meter elevated highway bridge crossing open turquoise bay water.
- Complete with concrete Jersey barriers, bridge pylons, guardrail lighting, and overhead steel gantry signs (*"VICE PORT EXPRESSWAY"*).
- Continuous, seamless physical collision grid without loading screens.

### 🏙️ Dual-City Metropolis
- **City 1 (Vice Beach)**: Ocean Drive promenade, palm trees, Art Deco beachfront hotels, neon signs, and pedestrian boulevards.
- **City 2 (Vice Bay Financial District)**:
  - **Maze Bank Tower**: 110-meter iconic skyscraper with neon crown and rooftop helipad.
  - **Vice Metro Center**: 92-meter emerald glass monolith.
  - **Lombank Headquarters**: Twin corporate towers joined by an aerial skybridge.
  - **Kaufman Tower & Apex Bay Suites**: Obsidian towers and luxury terraced buildings.
  - **VCPD Metro Headquarters**: Modern police department with active emergency beacons.
  - **Central Fountain Plaza**: Marble promenade, manicured planters, and water fountains.

### 🚶 Living AI & Pedestrians
- **High-Speed AI Traffic**: Highway cruisers traveling Northbound and Southbound between both cities, plus local city traffic.
- **Upright Humanoid Pedestrians**: ReadyPlayerMe civilians and Mixamo animations mathematically retargeted with `SkeletonUtils` for realistic walking loops.
- **Carjacking System**: Proximity prompts to pull drivers out and take vehicles (`[F]`).

### 🌅 Dynamic Day & Night System
- Natural celestial sun/moon cycle with atmospheric color grading (peach sunrise, turquoise noon, amber sunset, midnight neon).
- Instant time cycle controls via HUD button or **`[T]`** key.

---

## 🎮 Controls

### 🚗 Driving Controls
| Key | Action |
| --- | --- |
| **`W` / `↑`** | Accelerate (up to 138 MPH) |
| **`S` / `↓`** | Hydraulic Brake (Hold to Reverse) |
| **`A` / `D`** | Steer Wheels (Speed-sensitive) |
| **`SPACE`** | Handbrake Drift / Power Slide |
| **`F` / `E` / `Enter`** | Exit Vehicle |
| **`T`** | Cycle Time of Day (Morning / Noon / Sunset / Night) |
| **`H`** | Honk Horn |
| **`R`** | Cycle Radio Station |
| **`P`** | Open Smartphone |

### 🏃 On-Foot Controls
| Key | Action |
| --- | --- |
| **`W`, `A`, `S`, `D`** | Move / Walk |
| **`SHIFT`** | Sprint |
| **`SPACE`** | Jump |
| **`F` / `E` / `Enter`** | Jack / Enter Nearby Vehicle |
| **`T`** | Cycle Time of Day |
| **`Left Click` / `J`** | Attack / Fire Weapon |
| **`P`** | Open Smartphone |

---

## 🛠️ Tech Stack
- **Framework**: Next.js (App Router, Turbopack)
- **3D Graphics**: Three.js & React Three Fiber (`@react-three/fiber`)
- **Physics**: Rapier 3D (`@react-three/rapier`)
- **Animations**: Skeleton retargeting via Three.js `SkeletonUtils`
- **Audio**: Web Audio API Procedural Synthesizers & Radio
- **UI & HUD**: React, Tailwind CSS, Lucide Icons
- **State Management**: Zustand

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Esa006/gta-openworld-3d.git

# Navigate into the project
cd gta-openworld-3d

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play!
