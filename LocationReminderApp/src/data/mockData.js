// Mock data for demonstration purposes
export const mockReminders = [
  {
    id: '1',
    title: 'Buy groceries',
    type: 'checklist',
    content: [
      { id: '1a', text: 'Milk and eggs', completed: false },
      { id: '1b', text: 'Fresh vegetables', completed: false },
      { id: '1c', text: 'Bread and butter', completed: true },
      { id: '1d', text: 'Chicken breast', completed: false },
    ],
    location: 'Walmart Supercenter',
    locationData: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Walmart Supercenter, 123 Main St',
      radius: 150, // Geofence radius in meters
      timestamp: '2024-01-15T10:30:00Z',
    },
    geofence: {
      id: 'geofence_1',
      isActive: true,
      triggeredCount: 2,
      lastTriggered: '2024-01-16T08:45:00Z',
      transitionType: 'ENTER',
      createdAt: '2024-01-15T10:30:00Z',
    },
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Pick up dry cleaning',
    type: 'sentence',
    content: 'Remember to bring the receipt and check if the stain came out properly',
    location: 'Downtown Cleaners',
    locationData: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'Downtown Cleaners, 456 Oak Ave',
      radius: 100, // Default radius
      timestamp: '2024-01-14T14:20:00Z',
    },
    geofence: {
      id: 'geofence_2',
      isActive: true,
      triggeredCount: 0,
      lastTriggered: null,
      transitionType: 'ENTER',
      createdAt: '2024-01-14T14:20:00Z',
    },
    isActive: true,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Meet Sarah for coffee',
    type: 'sentence',
    content: 'Discuss the new project proposal and weekend plans',
    location: 'Starbucks Main Street',
    locationData: {
      latitude: 37.7649,
      longitude: -122.4294,
      address: 'Starbucks, 789 Main Street',
      radius: 75, // Smaller radius for precise location
      timestamp: '2024-01-13T09:15:00Z',
    },
    geofence: {
      id: 'geofence_3',
      isActive: true,
      triggeredCount: 1,
      lastTriggered: '2024-01-13T14:30:00Z',
      transitionType: 'ENTER',
      createdAt: '2024-01-13T09:15:00Z',
    },
    isActive: true,
    createdAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'Library tasks',
    type: 'checklist',
    content: [
      { id: '4a', text: 'Return overdue books', completed: false },
      { id: '4b', text: 'Pay late fees', completed: false },
      { id: '4c', text: 'Reserve new mystery novel', completed: false },
    ],
    location: 'Central Public Library',
    locationData: {
      latitude: 37.7949,
      longitude: -122.3994,
      address: 'Central Public Library, 321 Library Blvd',
      radius: 200, // Larger radius for library area
      timestamp: '2024-01-12T16:45:00Z',
    },
    geofence: {
      id: 'geofence_4',
      isActive: false, // Geofence disabled
      triggeredCount: 3,
      lastTriggered: '2024-01-12T17:20:00Z',
      transitionType: 'EXIT',
      createdAt: '2024-01-12T16:45:00Z',
    },
    isActive: true,
    createdAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    title: 'Pharmacy pickup',
    type: 'sentence',
    content: 'Pick up prescription refill and ask about flu shot availability',
    location: 'CVS Pharmacy',
    locationData: {
      latitude: 37.7549,
      longitude: -122.4394,
      address: 'CVS Pharmacy, 654 Health St',
      radius: 100, // Default radius
      timestamp: '2024-01-11T11:30:00Z',
    },
    geofence: {
      id: 'geofence_5',
      isActive: true,
      triggeredCount: 0,
      lastTriggered: null,
      transitionType: 'ENTER',
      createdAt: '2024-01-11T11:30:00Z',
    },
    isActive: true,
    createdAt: '2024-01-11T11:30:00Z',
  },
];

// Function to get active reminders
export const getActiveReminders = () => {
  return mockReminders.filter(reminder => reminder.isActive);
};

// Function to add a new reminder
export const addReminder = (reminder) => {
  mockReminders.unshift(reminder);
  return reminder;
};

// Function to update a reminder
export const updateReminder = (id, updates) => {
  const index = mockReminders.findIndex(reminder => reminder.id === id);
  if (index !== -1) {
    mockReminders[index] = { ...mockReminders[index], ...updates };
    return mockReminders[index];
  }
  return null;
};

// Function to delete a reminder
export const deleteReminder = (id) => {
  const index = mockReminders.findIndex(reminder => reminder.id === id);
  if (index !== -1) {
    return mockReminders.splice(index, 1)[0];
  }
  return null;
};

// Function to get reminder by ID
export const getReminderById = (id) => {
  return mockReminders.find(reminder => reminder.id === id);
};
