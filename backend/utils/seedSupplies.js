const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const SupplyProduct = require('../models/SupplyProduct');

const seedInitialSupplies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding agricultural supplies...');

    // 1. Ensure demo supplier accounts exist
    let supplier1 = await User.findOne({ email: 'supplier@smartgrow.lk' });
    if (!supplier1) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('supplier123', salt);
      supplier1 = await User.create({
        username: 'SmartGrow Automation Supplies',
        email: 'supplier@smartgrow.lk',
        password: hashedPassword,
        role: 'supplier',
        phoneNumber: '0771234567',
        location: 'Kandy Tech Park'
      });
      console.log('Created supplier account: supplier@smartgrow.lk');
    }

    let supplier2 = await User.findOne({ email: 'nutrients@ceylonagritech.lk' });
    if (!supplier2) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('supplier123', salt);
      supplier2 = await User.create({
        username: 'Ceylon AgriTech Nutrients',
        email: 'nutrients@ceylonagritech.lk',
        password: hashedPassword,
        role: 'supplier',
        phoneNumber: '0719876543',
        location: 'Colombo Industrial Zone'
      });
      console.log('Created supplier account: nutrients@ceylonagritech.lk');
    }

    // 2. Check existing supply products count
    const existingCount = await SupplyProduct.countDocuments();
    if (existingCount > 0) {
      console.log(`SupplyProduct collection already contains ${existingCount} items. Skipping re-seed.`);
      process.exit(0);
    }

    const initialSupplies = [
      {
        name: 'Calibrated Hydroponic NPK 19-19-19 Water-Soluble Fertilizer',
        category: 'Fertilizers',
        brand: 'AgroChem Lanka',
        model: 'NPK-19-PRO',
        sku: 'ACL-NPK19-5KG',
        description:
          '100% chelated water-soluble balanced NPK fertilizer formulated for greenhouse drip fertigation and closed-loop hydroponic reservoirs. Prevents emitter clogging.',
        images: [
          'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80'
        ],
        price: 24.50,
        unit: 'bag (5kg)',
        quantity: 42,
        lowStockThreshold: 8,
        minOrderQuantity: 1,
        supplier: supplier2._id,
        supplierName: supplier2.username,
        location: supplier2.location,
        warranty: 'Quality Sealed',
        isFeatured: true,
        specifications: {
          composition: 'N 19% : P2O5 19% : K2O 19% + Chelated Micro-nutrients (Fe, Zn, Mn, B)',
          packageSize: '5 kg moisture-lock foil bag',
          applicationInstructions:
            'Dissolve 1.5g - 2.0g per liter of irrigation water (Target EC: 1.6 - 2.2 mS/cm).',
          safetyPrecautions:
            'Store in a cool, dry place below 30°C. Wear gloves when mixing concentrated stock solutions.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Industrial Brass Solenoid Valve (12V DC Normally Closed)',
        category: 'Irrigation Equipment',
        brand: 'HydroFlow Dynamics',
        model: 'HF-SV12-G34',
        sku: 'HFD-SV12-034',
        description:
          'Heavy-duty forged brass solenoid valve for automated greenhouse irrigation zones and misting lines. Directly compatible with SmartGrow relay actuator modules.',
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'
        ],
        price: 18.90,
        unit: 'piece',
        quantity: 26,
        lowStockThreshold: 5,
        minOrderQuantity: 1,
        supplier: supplier1._id,
        supplierName: supplier1.username,
        location: supplier1.location,
        warranty: '1 Year Warranty',
        isFeatured: true,
        specifications: {
          voltage: '12V DC (±10%)',
          powerRequirements: '15W / 1.25A peak hold',
          supportedInterfaces: 'G 3/4" BSP Threaded Port, 2-pin waterproof Molex lead',
          operatingConditions: 'Pressure: 0.02 - 0.8 MPa | Fluid Temp: 0°C to 85°C | IP65 Coil',
          compatibility:
            'Compatible with SmartGrow OS Relay Nodes, ESP32/Arduino 12V MOSFET drivers, and PLC irrigation controllers.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Multi-Parameter Soil Moisture, EC & Temperature IoT Probe',
        category: 'IoT Components',
        brand: 'SenseCrop Telemetry',
        model: 'SC-RS485-3IN1',
        sku: 'SCT-RS485-3P',
        description:
          'Industrial 316L stainless-steel 3-probe soil telemetry sensor measuring volumetric water content, bulk electrical conductivity (EC), and root-zone temperature.',
        images: [
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
        ],
        price: 46.00,
        unit: 'kit',
        quantity: 14,
        lowStockThreshold: 5,
        minOrderQuantity: 1,
        supplier: supplier1._id,
        supplierName: supplier1.username,
        location: supplier1.location,
        warranty: '2 Year Replacement',
        isFeatured: true,
        specifications: {
          voltage: '5V - 24V DC wide input',
          powerRequirements: '< 0.15W active measurement',
          communicationProtocol: 'RS485 Modbus-RTU / I2C Bridge included',
          supportedInterfaces: 'IP68 Epoxy-sealed housing with 5m shielded 4-core cable',
          operatingConditions: '-20°C to +70°C | 0-100% RH non-condensing',
          compatibility:
            'Plug-and-play with SmartGrow Greenhouse Telemetry Node v2 and standard ESP32/STM32 UART gateways.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'F1 Hybrid Greenhouse Salad Cucumber Seeds (Parthenocarpic)',
        category: 'Seeds',
        brand: 'TropiSeed Genetics',
        model: 'TS-CUC-F1',
        sku: 'TSG-CUC-500',
        description:
          'High-yielding gynoecious parthenocarpic F1 cucumber seeds bred specifically for enclosed insect-netted greenhouses. Sets fruit without insect pollination.',
        images: [
          'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&auto=format&fit=crop&q=80'
        ],
        price: 14.20,
        unit: 'pack (500 seeds)',
        quantity: 60,
        lowStockThreshold: 10,
        minOrderQuantity: 2,
        supplier: supplier2._id,
        supplierName: supplier2.username,
        location: 'Nuwara Eliya Highland Hub',
        warranty: '95% Germination Cert.',
        isFeatured: false,
        specifications: {
          composition: 'Untreated Non-GMO F1 Hybrid Cucumis sativus seeds (Purity: 99.5%)',
          packageSize: '500 seeds hermetically sealed aluminum pouch',
          applicationInstructions:
            'Sow in sterilized cocopeat plugs at 1.5cm depth. Optimal germination temp: 24°C - 28°C.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: false },
        status: 'active'
      },
      {
        name: 'UV-Stabilized 200-Micron Greenhouse Poly Film (Diffused)',
        category: 'Greenhouse Equipment',
        brand: 'PolyShield Agri',
        model: 'PS-UV200-6M',
        sku: 'PSA-UV200-6X15',
        description:
          '5-layer co-extruded polyethylene greenhouse cladding film with anti-drip inner coating and 88% PAR light transmission for uniform canopy illumination.',
        images: [
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80'
        ],
        price: 85.00,
        unit: 'roll (6m x 15m)',
        quantity: 4,
        lowStockThreshold: 5,
        minOrderQuantity: 1,
        supplier: supplier1._id,
        supplierName: supplier1.username,
        location: 'Kurunegala Supply Depot',
        warranty: '3 Year UV Guarantee',
        isFeatured: false,
        specifications: {
          packageSize: '6m width x 15m length (200 Micron thickness)',
          operatingConditions: 'Withstands wind loads up to 110 km/h and high tropical UV index',
          applicationInstructions:
            'Install with smooth anti-drip side facing inside the greenhouse bay using PVC zig-zag lock profiles.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Automated Peristaltic Nutrient & pH Dosing Pump Controller',
        category: 'Hydroponic Equipment',
        brand: 'NutriPulse Labs',
        model: 'NP-DOSE-DUO',
        sku: 'NPL-DOSE-24V',
        description:
          'Dual-head precision peristaltic dosing pump with inline BNC pH & EC sensor ports. Automatically maintains target nutrient concentration in NFT hydroponic bays.',
        images: [
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80'
        ],
        price: 112.00,
        unit: 'system',
        quantity: 9,
        lowStockThreshold: 4,
        minOrderQuantity: 1,
        supplier: supplier1._id,
        supplierName: supplier1.username,
        location: supplier1.location,
        warranty: '1 Year Warranty',
        isFeatured: true,
        specifications: {
          voltage: '24V DC (AC/DC Adapter Included)',
          powerRequirements: '24W max',
          communicationProtocol: 'Wi-Fi MQTT + RS485 Telemetry Output',
          supportedInterfaces:
            '2x BNC Electrode Ports, Santoprene chemical-resistant peristaltic tubing (120 mL/min per head)',
          operatingConditions: '0°C to 50°C ambient | Acid/Alkali resistant tubing',
          compatibility:
            'Direct integration with SmartGrow Hydroponic Closed-Loop Bay telemetry dashboard.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'OMRI-Listed Cold-Pressed Neem Oil Bio-Insecticide (Azadirachtin 1500 ppm)',
        category: 'Crop Protection Products',
        brand: 'BioGuard Organics',
        model: 'BG-NEEM-1L',
        sku: 'BGO-NEEM-1000',
        description:
          'Broad-spectrum botanical crop protection emulsifiable concentrate for controlling whiteflies, aphids, thrips, and spider mites in organic greenhouses.',
        images: [
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80'
        ],
        price: 16.50,
        unit: 'bottle (1L)',
        quantity: 31,
        lowStockThreshold: 6,
        minOrderQuantity: 1,
        supplier: supplier2._id,
        supplierName: supplier2.username,
        location: supplier2.location,
        warranty: 'Certified Bio-Input',
        isFeatured: false,
        specifications: {
          composition:
            'Cold-Pressed Neem Kernel Oil (Azadirachtin 0.15% EC / 1500 ppm) + Natural saponin emulsifier',
          packageSize: '1 Liter HDPE UV-opaque bottle with measuring cap',
          applicationInstructions:
            'Dilute 3mL - 5mL per liter of water. Apply as fine foliar spray during early morning or dusk.',
          safetyPrecautions:
            'Do not apply during peak sunlight (>32°C) to avoid leaf burn. Safe for zero-pre-harvest-interval (0-PHI) crops.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Washed Low-EC Buffered Coco Peat Grow Slabs (100x18x12 cm)',
        category: 'Growing Supplies',
        brand: 'CocoLanka Substrates',
        model: 'CL-SLAB-LOWEC',
        sku: 'CLS-SLAB-100',
        description:
          'Triple-washed, calcium-buffered 70:30 coco peat to husk chip hydroponic grow bags with pre-cut plant holes and drainage slits for tomatoes and bell peppers.',
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80'
        ],
        price: 3.40,
        unit: 'slab',
        quantity: 150,
        lowStockThreshold: 25,
        minOrderQuantity: 10,
        supplier: supplier2._id,
        supplierName: supplier2.username,
        location: 'Nuwara Eliya Highland Hub',
        warranty: 'EC < 0.5 mS/cm Verified',
        isFeatured: false,
        specifications: {
          composition: '70% Buffered Coco Peat + 30% Crush Husk Chips (pH 5.8 - 6.4, EC < 0.5 mS/cm)',
          packageSize: 'Compressed 2.2kg slab (Expands to 100cm x 18cm x 12cm upon hydration)',
          applicationInstructions:
            'Hydrate with 14 liters of calcium-nitrate nutrient solution before transplanting seedlings.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Smart Greenhouse Climate & PAR Light Weather Node (LoRaWAN / Wi-Fi)',
        category: 'Smart Farming Devices',
        brand: 'SenseCrop Telemetry',
        model: 'SC-CLIMATE-PRO',
        sku: 'SCT-CLIM-LW',
        description:
          'Solar-rechargeable micro-climate station monitoring canopy PAR light (umol/m²/s), VPD (Vapor Pressure Deficit), CO2 ppm, air temperature, and relative humidity.',
        images: [
          'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&auto=format&fit=crop&q=80'
        ],
        price: 89.00,
        unit: 'unit',
        quantity: 11,
        lowStockThreshold: 3,
        minOrderQuantity: 1,
        supplier: supplier1._id,
        supplierName: supplier1.username,
        location: supplier1.location,
        warranty: '2 Year Warranty',
        isFeatured: true,
        specifications: {
          voltage: '5V USB-C / Integrated 3.7V 5000mAh LiFePO4 + 3W Solar Panel',
          powerRequirements: 'Ultra-low sleep current (45 uA)',
          communicationProtocol: 'Wi-Fi (MQTT/HTTP) + LoRaWAN 868/915 MHz',
          supportedInterfaces: 'Sensirion SHT40 + SCD41 CO2 + Apogee PAR Quantum Sensor port',
          operatingConditions: '-10°C to +65°C | IP66 weatherproof radiation shield',
          compatibility: 'Direct webhook & MQTT sync with SmartGrow OS Greenhouse Control Matrix.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      },
      {
        name: 'Stainless Steel Precision Hydroponic Pruning & Harvesting Shears',
        category: 'Farming Tools',
        brand: 'AgriEdge Tools',
        model: 'AE-PRUNE-SS',
        sku: 'AET-PRN-200',
        description:
          'Surgical-grade Japanese SK5 stainless steel micro-tip bypass pruners designed for sanitary vine pruning, sucker removal, and truss harvesting without stem crushing.',
        images: [
          'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80'
        ],
        price: 9.80,
        unit: 'pair',
        quantity: 75,
        lowStockThreshold: 12,
        minOrderQuantity: 1,
        supplier: supplier2._id,
        supplierName: supplier2.username,
        location: supplier2.location,
        warranty: 'Lifetime Spring Warranty',
        isFeatured: false,
        specifications: {
          composition: 'High-Carbon SK5 Stainless Steel blades with anti-sap PTFE coating',
          packageSize: '190mm length (145g ergonomic non-slip grip)',
          applicationInstructions:
            'Sterilize blades with 70% isopropyl alcohol between greenhouse bays to prevent viral transmission.'
        },
        deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
        status: 'active'
      }
    ];

    await SupplyProduct.insertMany(initialSupplies);
    console.log(`Successfully seeded ${initialSupplies.length} agricultural supply products into MongoDB!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding agricultural supplies:', err);
    process.exit(1);
  }
};

seedInitialSupplies();
