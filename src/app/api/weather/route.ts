import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY; // Access the API key from the environment variable

  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key is not available' }, { status: 500 });
  }

  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: res.status });
  }

  const data = await res.json();
  const weather = `${data.weather[0].description}, temperature is ${data.main.temp}°C`;

  return NextResponse.json({ weather });
}
