// Centralized fallback data system for CourierOS when database is offline or unreachable

export function getOwnerDashboardDemoData() {
  const today = new Date();
  
  const recentShipments = [
    {
      awbNumber: "DTDC84920194",
      senderName: "Pankaj Franchise",
      receiverName: "Apex Retail Pvt Ltd",
      receiverCity: "Mumbai",
      receiverState: "Maharashtra",
      status: "OUT_FOR_DELIVERY",
      serviceType: "EXPRESS",
      totalAmount: 1850,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 2 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC73910284",
      senderName: "TechCorp India",
      receiverName: "Rahul Sharma",
      receiverCity: "Delhi",
      receiverState: "Delhi",
      status: "IN_TRANSIT",
      serviceType: "STANDARD",
      totalAmount: 640,
      paymentMethod: "COD",
      createdAt: new Date(today.getTime() - 4 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC91827364",
      senderName: "Global Trade Co",
      receiverName: "Anita Verma",
      receiverCity: "Bangalore",
      receiverState: "Karnataka",
      status: "DELIVERED",
      serviceType: "EXPRESS",
      totalAmount: 2400,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 6 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC65492817",
      senderName: "Sunil Enterprises",
      receiverName: "Kiran Patel",
      receiverCity: "Ahmedabad",
      receiverState: "Gujarat",
      status: "AWAITING_PICKUP",
      serviceType: "SURFACE",
      totalAmount: 420,
      paymentMethod: "BILLING",
      createdAt: new Date(today.getTime() - 8 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC38201948",
      senderName: "BioHealth Labs",
      receiverName: "Dr. S. K. Gupta",
      receiverCity: "Kolkata",
      receiverState: "West Bengal",
      status: "SORTING_CENTER",
      serviceType: "EXPRESS",
      totalAmount: 1250,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 10 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC10928374",
      senderName: "Vanguard Systems",
      receiverName: "Meera Nair",
      receiverCity: "Cochin",
      receiverState: "Kerala",
      status: "BOOKED",
      serviceType: "STANDARD",
      totalAmount: 780,
      paymentMethod: "COD",
      createdAt: new Date(today.getTime() - 12 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC59281736",
      senderName: "Omni Logistics",
      receiverName: "Pooja Reddy",
      receiverCity: "Hyderabad",
      receiverState: "Telangana",
      status: "DELIVERED",
      serviceType: "INTERNATIONAL",
      totalAmount: 4500,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 16 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC48291038",
      senderName: "Precision Tools",
      receiverName: "Rajesh Joshi",
      receiverCity: "Pune",
      receiverState: "Maharashtra",
      status: "DELIVERED",
      serviceType: "SURFACE",
      totalAmount: 350,
      paymentMethod: "CASH",
      createdAt: new Date(today.getTime() - 20 * 3600 * 1000),
    },
  ];

  // 90 days revenue generator
  const allShipments90d: { createdAt: Date; totalAmount: number }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const count = 15 + Math.floor(Math.sin(i / 3) * 10 + Math.random() * 8);
    for (let j = 0; j < count; j++) {
      allShipments90d.push({
        createdAt: d,
        totalAmount: 300 + Math.floor(Math.random() * 1200),
      });
    }
  }

  const statusCounts = [
    { status: "DELIVERED", _count: { status: 142 } },
    { status: "IN_TRANSIT", _count: { status: 58 } },
    { status: "OUT_FOR_DELIVERY", _count: { status: 29 } },
    { status: "AWAITING_PICKUP", _count: { status: 14 } },
    { status: "BOOKED", _count: { status: 18 } },
    { status: "SORTING_CENTER", _count: { status: 22 } },
  ];

  const serviceCounts = [
    { serviceType: "EXPRESS", _count: { serviceType: 124 } },
    { serviceType: "STANDARD", _count: { serviceType: 98 } },
    { serviceType: "SURFACE", _count: { serviceType: 45 } },
    { serviceType: "INTERNATIONAL", _count: { serviceType: 16 } },
  ];

  const destinationCounts = [
    { receiverCity: "Mumbai", _count: { receiverCity: 64 } },
    { receiverCity: "Delhi", _count: { receiverCity: 52 } },
    { receiverCity: "Bangalore", _count: { receiverCity: 48 } },
    { receiverCity: "Hyderabad", _count: { receiverCity: 36 } },
    { receiverCity: "Chennai", _count: { receiverCity: 28 } },
    { receiverCity: "Kolkata", _count: { receiverCity: 22 } },
  ];

  const lowInventoryItems = [
    { id: "inv-1", itemName: "DTDC Air Express Flyers (500g)", currentStock: 8, unit: "Pcs", reorderLevel: 50 },
    { id: "inv-2", itemName: "Thermal Barcode Labels (4x6)", currentStock: 12, unit: "Rolls", reorderLevel: 30 },
    { id: "inv-3", itemName: "Security Tamper Bags (L)", currentStock: 5, unit: "Pcs", reorderLevel: 40 },
    { id: "inv-4", itemName: "Fragile Handle With Care Tapes", currentStock: 14, unit: "Rolls", reorderLevel: 25 },
  ];

  const recentActivityEvents = [
    {
      id: "evt-1",
      status: "OUT_FOR_DELIVERY",
      location: "Mumbai Central Sector 4",
      timestamp: new Date(today.getTime() - 15 * 60 * 1000),
      shipment: { awbNumber: "DTDC84920194" },
    },
    {
      id: "evt-2",
      status: "DELIVERED",
      location: "Bangalore Indiranagar Hub",
      timestamp: new Date(today.getTime() - 45 * 60 * 1000),
      shipment: { awbNumber: "DTDC91827364" },
    },
    {
      id: "evt-3",
      status: "SORTING_CENTER",
      location: "Kolkata National Sorting Hub",
      timestamp: new Date(today.getTime() - 90 * 60 * 1000),
      shipment: { awbNumber: "DTDC38201948" },
    },
    {
      id: "evt-4",
      status: "AWAITING_PICKUP",
      location: "Ahmedabad Satellite Office",
      timestamp: new Date(today.getTime() - 120 * 60 * 1000),
      shipment: { awbNumber: "DTDC65492817" },
    },
  ];

  return {
    todayShipments: 48,
    todayDelivered: 32,
    todayPendingPickup: 7,
    todayRevenueVal: 148950,
    todayCODVal: 42300,
    totalCustomers: 154,
    recentShipments,
    allShipments90d,
    statusCounts,
    serviceCounts,
    destinationCounts,
    lowInventoryItems,
    recentActivityEvents,
  };
}

export function getEmployeeDashboardDemoData() {
  const today = new Date();

  const recentShipments = [
    {
      awbNumber: "DTDC84920194",
      senderName: "Pankaj Franchise",
      receiverName: "Apex Retail Pvt Ltd",
      receiverCity: "Mumbai",
      status: "OUT_FOR_DELIVERY",
      serviceType: "EXPRESS",
      totalAmount: 1850,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 2 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC73910284",
      senderName: "TechCorp India",
      receiverName: "Rahul Sharma",
      receiverCity: "Delhi",
      status: "IN_TRANSIT",
      serviceType: "STANDARD",
      totalAmount: 640,
      paymentMethod: "COD",
      createdAt: new Date(today.getTime() - 4 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC91827364",
      senderName: "Global Trade Co",
      receiverName: "Anita Verma",
      receiverCity: "Bangalore",
      status: "DELIVERED",
      serviceType: "EXPRESS",
      totalAmount: 2400,
      paymentMethod: "ONLINE",
      createdAt: new Date(today.getTime() - 6 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC65492817",
      senderName: "Sunil Enterprises",
      receiverName: "Kiran Patel",
      receiverCity: "Ahmedabad",
      status: "AWAITING_PICKUP",
      serviceType: "SURFACE",
      totalAmount: 420,
      paymentMethod: "BILLING",
      createdAt: new Date(today.getTime() - 8 * 3600 * 1000),
    },
  ];

  const recentCustomers = [
    {
      id: "cust-1",
      user: { name: "Apex Retail Pvt Ltd", email: "contact@apexretail.com" },
      city: "Mumbai",
      _count: { shipments: 28 },
      totalSpend: 42800,
    },
    {
      id: "cust-2",
      user: { name: "TechCorp India", email: "dispatch@techcorp.in" },
      city: "Delhi",
      _count: { shipments: 19 },
      totalSpend: 31400,
    },
    {
      id: "cust-3",
      user: { name: "Global Trade Co", email: "logistics@globaltrade.com" },
      city: "Bangalore",
      _count: { shipments: 14 },
      totalSpend: 26900,
    },
  ];

  const dynamicServiceBreakdown = [
    { label: "Air Express", count: 85, pct: 45, totalAmount: 98500 },
    { label: "Surface Freight", count: 42, pct: 22, totalAmount: 32400 },
    { label: "Local Courier", count: 48, pct: 25, totalAmount: 24100 },
    { label: "International", count: 14, pct: 8, totalAmount: 45000 },
  ];

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dynamicMonthlyTrend = monthNames.map((m, idx) => ({
    month: m,
    amount: 15000 + Math.floor(Math.sin(idx) * 5000 + idx * 2500),
    count: 20 + idx * 3,
  }));

  return {
    todayBookings: 24,
    yesterdayBookings: 18,
    pendingPickups: 5,
    completedToday: 16,
    yesterdayCompleted: 14,
    outForDelivery: 9,
    recentShipments,
    recentCustomers,
    dynamicServiceBreakdown,
    dynamicMonthlyTrend,
  };
}

export function getCustomerDashboardDemoData() {
  const today = new Date();

  const recentShipments = [
    {
      awbNumber: "DTDC84920194",
      receiverName: "Apex Retail Pvt Ltd",
      receiverCity: "Mumbai",
      receiverState: "Maharashtra",
      status: "OUT_FOR_DELIVERY",
      serviceType: "EXPRESS",
      totalAmount: 1850,
      createdAt: new Date(today.getTime() - 2 * 3600 * 1000),
      expectedDelivery: new Date(today.getTime() + 6 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC91827364",
      receiverName: "Anita Verma",
      receiverCity: "Bangalore",
      receiverState: "Karnataka",
      status: "DELIVERED",
      serviceType: "EXPRESS",
      totalAmount: 2400,
      createdAt: new Date(today.getTime() - 24 * 3600 * 1000),
      expectedDelivery: new Date(today.getTime() - 2 * 3600 * 1000),
    },
    {
      awbNumber: "DTDC73910284",
      receiverName: "Rahul Sharma",
      receiverCity: "Delhi",
      receiverState: "Delhi",
      status: "IN_TRANSIT",
      serviceType: "STANDARD",
      totalAmount: 640,
      createdAt: new Date(today.getTime() - 48 * 3600 * 1000),
      expectedDelivery: new Date(today.getTime() + 24 * 3600 * 1000),
    },
  ];

  const savedAddresses = [
    {
      id: "addr-1",
      name: "Corporate Office",
      contactName: "Sunil Verma",
      phone: "9822012345",
      street: "102 Empire Heights, MG Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Delhi Warehouse",
      contactName: "Vikram Malhotra",
      phone: "9811098765",
      street: "Plot 45, Okhla Phase 3",
      city: "Delhi",
      state: "Delhi",
      pincode: "110020",
      isDefault: false,
    },
  ];

  return {
    activeShipments: 2,
    deliveredCount: 14,
    totalSpend: 34850,
    recentShipments,
    savedAddresses,
  };
}

export function getDemoShipmentDetail(id: string) {
  const demoList = getOwnerDashboardDemoData().recentShipments;

  // Try finding by exact awbNumber or shp-demo-idx or index digit
  let index = -1;
  if (id.includes("shp-demo-")) {
    index = parseInt(id.replace("shp-demo-", ""), 10);
  } else if (/^\d+$/.test(id)) {
    index = parseInt(id, 10);
  } else if (id.startsWith("DTDC")) {
    const digits = id.replace(/[^0-9]/g, "");
    if (digits.length === 1) index = parseInt(digits, 10);
    else index = demoList.findIndex((s) => s.awbNumber === id);
  }

  let matched = index >= 0 && index < demoList.length ? demoList[index] : demoList.find((s) => s.awbNumber === id);
  if (!matched) {
    matched = demoList[0];
  }

  const now = new Date();
  const awb = matched.awbNumber;
  const status = matched.status;

  // Build dynamic tracking events based on actual status
  const events: any[] = [
    { id: "tr-1", status: "BOOKED", location: "Pune Counter Desk", description: "Shipment booked & label printed", timestamp: new Date(now.getTime() - 24 * 3600 * 1000) },
  ];

  if (status !== "BOOKED" && status !== "AWAITING_PICKUP") {
    events.push({ id: "tr-2", status: "ORIGIN_HUB", location: "Pune Hub", description: "Consignment scanned into regional container", timestamp: new Date(now.getTime() - 18 * 3600 * 1000) });
  }

  if (status === "IN_TRANSIT" || status === "OUT_FOR_DELIVERY" || status === "DELIVERED") {
    events.push({ id: "tr-3", status: "SORTING_CENTER", location: `${matched.receiverCity} Central Sorting`, description: "Processed through automated sorter", timestamp: new Date(now.getTime() - 10 * 3600 * 1000) });
  }

  if (status === "OUT_FOR_DELIVERY" || status === "DELIVERED") {
    events.push({ id: "tr-4", status: "OUT_FOR_DELIVERY", location: `${matched.receiverCity} Last-Mile Van`, description: "Out for delivery with driver", timestamp: new Date(now.getTime() - 2 * 3600 * 1000) });
  }

  if (status === "DELIVERED") {
    events.push({ id: "tr-5", status: "DELIVERED", location: matched.receiverCity, description: "Delivered & OTP verified by recipient", timestamp: new Date(now.getTime() - 30 * 60 * 1000) });
  }

  return {
    id: id || "demo-shp-1",
    awbNumber: awb,
    branchId: "branch-pune-1",
    senderName: matched.senderName || "Pankaj Franchise / Saubhari Enterprises",
    senderPhone: "+91 9822012345",
    senderAddress: "Plot 14, Sector 5, Industrial Area",
    senderCity: "Pune",
    senderState: "Maharashtra",
    senderPincode: "411001",
    receiverName: matched.receiverName,
    receiverPhone: "+91 9811098765",
    receiverAddress: "Building 4B, Mindspace IT Park",
    receiverCity: matched.receiverCity,
    receiverState: matched.receiverState,
    receiverPincode: "400001",
    parcelType: "PARCEL",
    weight: 2.5,
    length: 30,
    width: 20,
    height: 15,
    declaredValue: 2500,
    hasInsurance: false,
    insuranceAmount: 0,
    description: `${matched.serviceType} Parcel to ${matched.receiverCity}`,
    serviceType: matched.serviceType,
    status: status,
    pickupRequired: status === "AWAITING_PICKUP",
    freightCharge: Math.round(matched.totalAmount * 0.8),
    fuelSurcharge: Math.round(matched.totalAmount * 0.1),
    insuranceCharge: 0,
    codAmount: matched.paymentMethod === "COD" ? matched.totalAmount : 0,
    totalAmount: matched.totalAmount,
    paymentMethod: matched.paymentMethod,
    handledById: "emp-1",
    createdAt: matched.createdAt,
    updatedAt: now,
    expectedDelivery: new Date(now.getTime() + (status === "DELIVERED" ? -2 : 24) * 3600 * 1000),
    branch: {
      id: "branch-pune-1",
      name: "DTDC Franchise (Saubhari Enterprises)",
      address: "DTDC Counter Desk, Main Branch",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      phone: "+91 9822012345",
      email: "owner@dtdc.demo",
      settings: { gstNumber: "27AAACD1234F1Z9", branchCode: "DTDC-PUN-01" },
    },
    customer: {
      id: "cust-1",
      customerCode: "CUST-2026-001",
      companyName: matched.receiverName,
      user: { name: matched.receiverName, email: "contact@demo.com", phone: "+91 9811098765" },
    },
    handledBy: {
      id: "emp-1",
      staffId: "EMP-101",
      user: { name: "Counter Staff Operator 1" },
    },
    trackingEvents: events,
    payment: {
      id: "pay-1",
      method: matched.paymentMethod,
      amount: matched.totalAmount,
      status: "COLLECTED",
      collectedAt: matched.createdAt,
    },
    invoice: {
      id: "inv-1",
      invoiceNumber: `INV-${awb}`,
      amount: Math.round(matched.totalAmount / 1.18),
      tax: Math.round(matched.totalAmount - matched.totalAmount / 1.18),
      total: matched.totalAmount,
      issuedAt: matched.createdAt,
    },
  };
}
