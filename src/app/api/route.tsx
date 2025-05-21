/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type BaseParams = {
  address: `0x${string}`;
  data?: string;
};

// Fungsi untuk menghasilkan warna bebas dari hash alamat
function generateColorsFromAddress(address: string): { primary: string; secondary: string } {
  const hash = parseInt(address.slice(2, 10), 16);
  const hue = hash % 360; // Hue penuh (0-360) untuk semua warna
  const primary = `hsl(${hue}, 70%, 50%)`; // Warna primer
  const secondary = `hsl(${(hue + 60) % 360}, 80%, 60%)`; // Warna sekunder
  return { primary, secondary };
}

// Fungsi untuk menghasilkan pola ombak horizontal
function generateWavePattern(address: string): { y1: number; y2: number; cx1: number; cy1: number; cx2: number; cy2: number }[] {
  const waves: { y1: number; y2: number; cx1: number; cy1: number; cx2: number; cy2: number }[] = [];
  const seed = parseInt(address.slice(2, 10), 16); // Seed dari address
  const count = 18 + (seed % 4); // Jumlah ombak (18-21)

  for (let i = 0; i < count; i++) {
    const y = 50 + (i * 900) / (count - 1); // Distribusi vertikal
    const offset = (seed + i * 41) % 300; // Offset untuk variasi
    const y1 = y; // Titik awal (kiri)
    const y2 = y; // Titik akhir (kanan)
    const cx1 = 250 + (offset % 200) - 100; // Titik kontrol 1
    const cy1 = y + (offset % 150) - 75; // Ketinggian kontrol 1
    const cx2 = 750 - (offset % 180) + 90; // Titik kontrol 2
    const cy2 = y - (offset % 150) + 75; // Ketinggian kontrol 2
    waves.push({ y1, y2, cx1, cy1, cx2, cy2 });
  }
  return waves;
}

// Fungsi untuk menghasilkan bintang kecil
function generateStars(data: string | undefined): { x: number; y: number; size: number; color: string }[] {
  const stars: { x: number; y: number; size: number; color: string }[] = [];
  const seed = data ? parseInt(data.slice(2, 10), 16) : 0;
  const count = data && !isNaN(parseInt(data)) ? parseInt(data) : 5; // Jumlah bintang dari data atau default 5

  for (let i = 0; i < count; i++) {
    const x = 50 + ((seed + i * 97) % 900); // Posisi x acak
    const y = 50 + ((seed + i * 53) % 900); // Posisi y acak
    const size = 5 + ((seed + i) % 5); // Ukuran 5-10 piksel
    const hue = (seed + i * 137) % 360; // Warna-warni acak
    const color = `hsl(${hue}, 80%, 70%)`;
    stars.push({ x, y, size, color });
  }
  return stars;
}

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url?.split("?")[1]);
  const { address, data } = Object.fromEntries(searchParams.entries()) as BaseParams;

  // Validasi alamat
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: "valid address is required" }, { status: 400 });
  }

  try {
    const { primary, secondary } = generateColorsFromAddress(address); // Warna bebas dinamis
    const waves = generateWavePattern(address); // Pola ombak horizontal
    const stars = generateStars(data); // Bintang kecil

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "hsl(220, 20%, 10%)", // Latar belakang gelap (biru tua)
          }}
        >
          {/* SVG dengan pola ombak dan bintang */}
          <svg
            width="1000"
            height="1000"
            viewBox="0 0 1000 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradien radial untuk latar belakang */}
            <defs>
              <radialGradient id="gradient" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={secondary} stopOpacity="0.4" />
                <stop offset="100%" stopColor={primary} stopOpacity="0.1" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="1000" height="1000" fill="url(#gradient)" />
            {/* Pola ombak horizontal melengkung */}
            {waves.map((wave, index) => (
              <path
                key={index}
                d={`M0,${wave.y1} C${wave.cx1},${wave.cy1} ${wave.cx2},${wave.cy2} 1000,${wave.y2}`}
                stroke={index % 2 === 0 ? primary : secondary}
                strokeWidth={10 + (index % 5)} // Ketebalan 10-14
                strokeOpacity="0.6"
                fill="none"
              />
            ))}
            {/* Bintang kecil */}
            {stars.map((star, index) => (
              <path
                key={`star-${index}`}
                d="M0,-10 L2.93,-4.04 L9.51,-3.09 L4.76,1.55 L5.88,8.09 L0,5 L-5.88,8.09 L-4.76,1.55 L-9.51,-3.09 L-2.93,-4.04 Z"
                transform={`translate(${star.x}, ${star.y}) scale(${star.size / 10})`}
                fill={star.color}
                fillOpacity="0.9"
              />
            ))}
          </svg>
        </div>
      ),
      {
        width: 1000,
        height: 1000,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
