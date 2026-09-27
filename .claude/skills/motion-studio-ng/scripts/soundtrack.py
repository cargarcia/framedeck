"""Generate a naval sound bed for a motion-studio video, with no external samples.

Usage: python3 soundtrack.py cues.json out.wav

cues.json:
{
  "duration": 15.0,
  "cuts": [2.43, 4.93, 7.43],          # scene arrivals: whoosh before, hit on arrival
  "pings": [2.43, 3.73],               # sonar pings with echoes
  "pulseFrom": 7.43, "pulseTo": 13.5,  # 120 BPM kick pulse
  "blips": [7.6, 12.0],                # [start, end] of random data blips
  "arpeggio": 11.95,                   # rising 16th-note arpeggio start (optional)
  "brandHit": 13.6                     # final impact + chord (optional)
}
"""
import json
import math
import random
import struct
import sys
import wave

SR = 48000
rnd = random.Random(11)


class Mix:
    def __init__(self, duration):
        self.size = int(SR * duration)
        self.left = [0.0] * self.size
        self.right = [0.0] * self.size

    def add(self, start, samples, gain=1.0, pan=0.0):
        offset = int(start * SR)
        gain_left = gain * math.cos((pan + 1) * math.pi / 4)
        gain_right = gain * math.sin((pan + 1) * math.pi / 4)
        for index, sample in enumerate(samples):
            position = offset + index
            if 0 <= position < self.size:
                self.left[position] += sample * gain_left
                self.right[position] += sample * gain_right

    def write(self, path):
        peak = max(max(map(abs, self.left)), max(map(abs, self.right))) or 1.0
        frames = bytearray()
        for index in range(self.size):
            fade = min(1.0, (self.size - index) / (0.1 * SR), index / (0.02 * SR) + 0.001)
            for value in (self.left[index], self.right[index]):
                shaped = math.tanh(1.3 * value / peak) / math.tanh(1.3) * 0.89 * fade
                frames += struct.pack("<h", int(shaped * 32767))
        with wave.open(path, "wb") as output:
            output.setnchannels(2)
            output.setsampwidth(2)
            output.setframerate(SR)
            output.writeframes(bytes(frames))


def tone(freq, length, decay=3.0, harmonics=(1, 0.4), attack=0.005):
    return [
        sum(a * math.sin(2 * math.pi * freq * (k + 1) * i / SR) for k, a in enumerate(harmonics))
        * min(1.0, i / SR / attack) * math.exp(-i / SR * decay)
        for i in range(int(length * SR))
    ]


def noise(length, cutoff, envelope):
    output, lowpass, total = [], 0.0, int(length * SR)
    for i in range(total):
        progress = i / total
        lowpass += cutoff(progress) * ((rnd.random() * 2 - 1) - lowpass)
        output.append(lowpass * envelope(progress))
    return output


def sweep_down(length, base, span, decay, saturation=1.8):
    output, phase = [], 0.0
    for i in range(int(length * SR)):
        t = i / SR
        phase += 2 * math.pi * (base + span * math.exp(-t * 9)) / SR
        output.append(math.tanh(saturation * math.sin(phase)) * math.exp(-t * decay))
    return output


def main(cues_path, out_path):
    cues = json.load(open(cues_path))
    mix = Mix(cues.get("duration", 15.0))

    for freq, gain in [(73.42, 0.22), (110.0, 0.12), (146.83, 0.06)]:
        bed = [
            math.sin(2 * math.pi * freq * i / SR + 0.3 * math.sin(i / SR * 2))
            * (0.5 + 0.5 * math.sin(i / SR * 0.7 + freq)) * min(1, i / SR / 1.5)
            for i in range(mix.size)
        ]
        mix.add(0, bed, gain)

    for cut in cues.get("cuts", []):
        mix.add(cut - 0.7, noise(0.7, lambda p: 0.004 + 0.3 * p ** 2, lambda p: 3 * p ** 2.2), 0.5)
        mix.add(cut + 0.15, sweep_down(0.6, 36, 70, 5.6), 0.35)

    for start in cues.get("pings", []):
        ping = tone(1318.5, 1.4, decay=3.2, harmonics=(1, 0.15), attack=0.002)
        for echo in range(4):
            mix.add(start + echo * 0.23, ping, 0.2 * 0.5 ** echo, pan=0.5 * (-1) ** echo)

    if "pulseFrom" in cues:
        beat = cues["pulseFrom"]
        while beat < cues.get("pulseTo", mix.size / SR):
            mix.add(beat, sweep_down(0.3, 48, 90, 9, saturation=1.0), 0.55)
            beat += 0.5

    if "blips" in cues:
        start, end = cues["blips"]
        count = int((end - start) / 0.21)
        for index in range(count):
            freq = rnd.choice([1760, 2093, 2637])
            mix.add(start + index * 0.21, tone(freq, 0.08, decay=40, harmonics=(1,)), 0.07, pan=rnd.random() * 1.6 - 0.8)

    if "arpeggio" in cues:
        notes = [293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 880.0, 1046.5]
        for step in range(24):
            freq = notes[step % len(notes)] * (1 + step // 8)
            mix.add(cues["arpeggio"] + step * 0.0625, tone(freq, 0.12, decay=24, harmonics=(1, 0.5, 0.25)), 0.09, pan=0.6 * math.sin(step))

    if "brandHit" in cues:
        hit = cues["brandHit"]
        mix.add(hit, sweep_down(1.4, 36, 70, 2.2), 0.95)
        for index, freq in enumerate([146.83, 220.0, 293.66, 369.99, 440.0]):
            mix.add(hit, tone(freq, 1.4, decay=1.2, harmonics=(1, 0.3, 0.1), attack=0.02), 0.08, pan=(index - 2) / 2)

    mix.write(out_path)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
