// Mock data for demonstration purposes
export const mockReminders = [
  {
    id: '1',
    title: 'Buy groceries',
    location: 'Walmart Supercenter',
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Pick up dry cleaning',
    location: 'Downtown Cleaners',
    isActive: true,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'Meet Sarah for coffee',
    location: 'Starbucks Main Street',
    isActive: true,
    createdAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'Return library books',
    location: 'Central Public Library',
    isActive: true,
    createdAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    title: 'Pharmacy pickup',
    location: 'CVS Pharmacy',
    isActive: true,
    createdAt: '2024-01-11T11:30:00Z',
  },
];

// Function to get active reminders
export const getActiveReminders = () => {
  return mockReminders.filter(reminder => reminder.isActive);
};
