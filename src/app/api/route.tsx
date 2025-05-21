/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type BaseParams = {
  address: `0x${string}`;
  data?: string;
};

// Fungsi untuk menghasilkan warna biru dari hash alamat
function generateBlueColorsFromAddress(address: string): { primary: string; secondary: string } {
  const hash = parseInt(address.slice(2, 10), 16);
  const hue = 180 + (hash % 60); // Hue biru (180-240: biru langit hingga biru tua)
  const primary = `hsl(${hue}, 70%, 50%)`; // Warna primer
  const secondary = `hsl(${hue + 20}, 80%, 60%)`; // Warna sekunder lebih cerah
  return { primary, secondary };
}

// Fungsi untuk menghasilkan pola ombak vertikal
function generateWavePattern(address: string): { x1: number; x2: number; cx1: number; cy1: number; cx2: number; cy2: number }[] {
  const waves: { x1: number; x2: number; cx1: number; cy1: number; cx2: number; cy2: number }[] = [];
  const seed = parseInt(address.slice(2, 10), 16); // Seed dari address
  const count = 5 + (seed % 6); // Jumlah ombak (5-10)

  for (let i = 0; i < count; i++) {
    const x = 50 + (i * 400) / (count - 1); // Distribusi horizontal
    const offset = (seed + i * 37) % 200; // Offset untuk variasi
    const x1 = x; // Titik awal (atas)
    const x2 = x; // Titik akhir (bawah)
    const cx1 = x + (offset % 100) - 50; // Titik kontrol 1 (lengkungan)
    const cy1 = 150 + (offset % 100); // Ketinggian kontrol 1
    const cx2 = x - (offset % 80) + 40; // Titik kontrol 2
    const cy2 = 350 - (offset % 100); // Ketinggian kontrol 2
    waves.push({ x1, x2, cx1, cy1, cx2, cy2 });
  }
  return waves;
}

export async function GET(request: NextRequest) {
  const searchParams = new URLSearchParams(request.url?.split("?")[1]);
  const { address } = Object.fromEntries(searchParams.entries()) as BaseParams;

  // Validasi alamat
  if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
    return NextResponse.json({ error: "valid address is required" }, { status: 400 });
  }

  try {
    const { primary, secondary } = generateBlueColorsFromAddress(address); // Warna biru dinamis
    const waves = generateWavePattern(address); // Pola ombak

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "white",
          }}
        >
          {/* SVG dengan pola ombak */}
          <svg
            width="500"
            height="500"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradien radial untuk latar belakang */}
            <defs>
              <radialGradient id="gradient" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={secondary} stopOpacity="0.5" />
                <stop offset="100%" stopColor={primary} stopOpacity="0.2" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="500" height="500" fill="url(#gradient)" />
            {/* Pola ombak vertikal melengkung */}
            {waves.map((wave, index) => (
              <path
                key={index}
                d={`M${wave.x1},0 C${wave.cx1},${wave.cy1} ${wave.cx2},${wave.cy2} ${wave.x2},500`}
                stroke={index % 2 === 0 ? primary : secondary} // Alternasi warna
                strokeWidth={8 + (index % 3)} // Ketebalan bervariasi
                strokeOpacity="0.7"
                fill="none"
              />
            ))}
          </svg>
        </div>
      ),
      {
        width: 500,
        height: 500,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}
