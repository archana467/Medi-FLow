import fs from 'fs';

async function runTest() {
  const baseUrl = 'http://localhost:5000/api';
  
  // 1. Register a NEW patient
  const email = `testpatient_${Date.now()}@test.com`;
  const registerPayload = {
    name: 'Test Patient',
    email,
    password: 'password123',
    role: 'PATIENT'
  };

  console.log('Registering user...', email);
  let res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });
  
  let data = await res.json();
  if (!data.success) {
    console.error('Registration failed:', data);
    return;
  }
  console.log('Registration success:', data.user);
  
  // Login to get token
  console.log('Logging in...');
  res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  data = await res.json();
  if (!data.success) {
    console.error('Login failed:', data);
    return;
  }
  const token = data.accessToken;
  console.log('Login success, got token');
  
  // Get doctors to book
  console.log('Fetching doctors...');
  res = await fetch(`${baseUrl}/doctors`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  if (!data.success || !data.data || data.data.length === 0) {
    console.error('No doctors found or fetch failed:', data);
    return;
  }
  
  const doctorId = data.data[0].id || data.data[0]._id;
  console.log('Selected doctor:', doctorId);
  
  // Book appointment
  console.log('Booking appointment...');
  const appointmentPayload = {
    doctorId,
    appointmentDate: '2027-10-10',
    startTime: '10:00',
    endTime: '10:30',
    reason: 'Test booking'
  };
  
  res = await fetch(`${baseUrl}/appointments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(appointmentPayload)
  });
  data = await res.json();
  
  if (data.success) {
    console.log('Appointment booked successfully!');
    console.log(data.data);
  } else {
    console.error('Appointment booking failed:', data);
  }
}

runTest().catch(console.error);
