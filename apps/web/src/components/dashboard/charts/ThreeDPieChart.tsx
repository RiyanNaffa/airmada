// // =============================================================================
// // 3D PIE CHART — MATH HELPERS
// // =============================================================================

// import { useMemo, useState } from "react"

// /** Point on an ellipse. angleDeg=0 → top, clockwise. */
// function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angleDeg: number) {
//   const rad = ((angleDeg - 90) * Math.PI) / 180
//   return { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) }
// }

// /** SVG path for the top face of one pie slice. */
// function describeTopSlice(
//   cx: number, cy: number, rx: number, ry: number,
//   startAngle: number, endAngle: number
// ): string {
//   if (endAngle - startAngle >= 359.9) {
//     return `M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx - 0.001} ${cy - ry} Z`
//   }
//   const s = ellipsePoint(cx, cy, rx, ry, startAngle)
//   const e = ellipsePoint(cx, cy, rx, ry, endAngle)
//   const largeArc = endAngle - startAngle > 180 ? 1 : 0
//   return `M ${cx} ${cy} L ${s.x} ${s.y} A ${rx} ${ry} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
// }

// /**
//  * SVG path for the visible 3-D side panel of one slice.
//  * Only the arc portion within [90°, 270°] is visible (bottom-facing).
//  */
// function describeSidePanel(
//   cx: number, cy: number, rx: number, ry: number, depth: number,
//   startAngle: number, endAngle: number
// ): string | null {
//   const visStart = Math.max(startAngle, 90)
//   const visEnd = Math.min(endAngle, 270)
//   if (visStart >= visEnd) return null

//   const s = ellipsePoint(cx, cy, rx, ry, visStart)
//   const e = ellipsePoint(cx, cy, rx, ry, visEnd)
//   const largeArc = visEnd - visStart > 180 ? 1 : 0

//   return [
//     `M ${s.x} ${s.y}`,
//     `A ${rx} ${ry} 0 ${largeArc} 1 ${e.x} ${e.y}`,
//     `L ${e.x} ${e.y + depth}`,
//     `A ${rx} ${ry} 0 ${largeArc} 0 ${s.x} ${s.y + depth}`,
//     `Z`,
//   ].join(' ')
// }

// /** SVG path for a straight side wall along the radius line (for slice edges in the visible half). */
// function describeEdgeWall(
//   cx: number, cy: number, rx: number, ry: number, depth: number,
//   angleDeg: number
// ): string | null {
//   // Only render for angles in visible range
//   if (angleDeg < 90 || angleDeg > 270) return null
//   const pt = ellipsePoint(cx, cy, rx, ry, angleDeg)
//   return `M ${cx} ${cy} L ${pt.x} ${pt.y} L ${pt.x} ${pt.y + depth} L ${cx} ${cy + depth} Z`
// }

// // =============================================================================
// // 3D PIE CHART COMPONENT
// // =============================================================================

// const PIE_META = [
//   { key: 'pending',   label: 'Pending',    color: '#F59E0B', dark: '#92400E', mid: '#D97706' },
//   { key: 'assigned',  label: 'Assigned',   color: '#3B82F6', dark: '#1E3A8A', mid: '#1D4ED8' },
//   { key: 'inTransit', label: 'In Transit', color: '#A855F7', dark: '#581C87', mid: '#7E22CE' },
//   { key: 'pickedUp',  label: 'Picked Up',  color: '#6366F1', dark: '#312E81', mid: '#4338CA' },
//   { key: 'delivered', label: 'Delivered',  color: '#10B981', dark: '#064E3B', mid: '#059669' },
//   { key: 'failed',    label: 'Failed',     color: '#EF4444', dark: '#7F1D1D', mid: '#DC2626' },
//   { key: 'returned',  label: 'Returned',   color: '#94A3B8', dark: '#1E293B', mid: '#64748B' },
// ] as const

// type PieKey = (typeof PIE_META)[number]['key']

// interface SummaryData {
//   pending: number; assigned: number; inTransit: number; pickedUp: number
//   delivered: number; failed: number; returned: number
// }

// function ThreeDPieChart({ summary }: { summary: SummaryData }) {
//   const [hovered, setHovered] = useState<number | null>(null)

//   // ── Build slices from summary ──────────────────────────────────────────────
//   const { slices, total } = useMemo(() => {
//     const summaryMap: Record<PieKey, number> = {
//       pending: summary.pending,
//       assigned: summary.assigned,
//       inTransit: summary.inTransit,
//       pickedUp: summary.pickedUp,
//       delivered: summary.delivered,
//       failed: summary.failed,
//       returned: summary.returned,
//     }

//     const active = PIE_META.filter((m) => summaryMap[m.key] > 0)
//     const total = active.reduce((s, m) => s + summaryMap[m.key], 0)
//     if (total === 0) return { slices: [], total: 0 }

//     let currentAngle = 0
//     const slices = active.map((m, _i) => {
//       const value = summaryMap[m.key]
//       const startAngle = currentAngle
//       const sweep = (value / total) * 360
//       const endAngle = currentAngle + sweep
//       currentAngle = endAngle
//       const midAngle = startAngle + sweep / 2
//       const midRad = ((midAngle - 90) * Math.PI) / 180
//       return {
//         ...m,
//         value,
//         startAngle,
//         endAngle,
//         midAngle,
//         percentage: Math.round((value / total) * 100),
//         dx: Math.cos(midRad) * 20,
//         dy: Math.sin(midRad) * 20,
//       }
//     })

//     return { slices, total }
//   }, [summary])

//   // ── SVG geometry constants ─────────────────────────────────────────────────
//   const cx = 165
//   const cy = 118
//   const rx = 138
//   const ry = 62
//   const depth = 38

//   const grandTotal = Object.values(summary).reduce((a, b) => a + b, 0)

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
//         <div>
//           <h3 className="text-sm font-semibold text-slate-800">Shipment Status Distribution</h3>
//           <p className="text-xs text-slate-400 mt-0.5">Overview seluruh status pengiriman</p>
//         </div>
//         <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
//           {grandTotal} total
//         </span>
//       </div>

//       <div className="flex flex-col items-center gap-2 p-5 sm:flex-row sm:items-start sm:gap-6">
//         {/* ── SVG 3D Pie ──────────────────────────────────────────────────── */}
//         <div className="w-full max-w-[340px] flex-shrink-0">
//           <svg
//             viewBox="0 0 330 235"
//             className="w-full overflow-visible"
//             style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.10))' }}
//           >
//             <defs>
//               {/* ── Keyframes ── */}
//               <style>{`
//                 @keyframes slice3dIn {
//                   0%   { transform: scale(0.05); opacity: 0; }
//                   60%  { transform: scale(1.06); opacity: 1; }
//                   80%  { transform: scale(0.97); }
//                   100% { transform: scale(1);    opacity: 1; }
//                 }
//                 @keyframes fadeIn {
//                   from { opacity: 0; }
//                   to   { opacity: 1; }
//                 }
//                 .slice-group {
//                   animation: slice3dIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
//                   transform-origin: ${cx}px ${cy}px;
//                 }
//                 .slice-label {
//                   animation: fadeIn 0.3s ease both;
//                   pointer-events: none;
//                   user-select: none;
//                 }
//               `}</style>

//               {/* ── Per-slice gradient for side depth ── */}
//               {slices.map((s, i) => (
//                 <linearGradient key={`grad-${i}`} id={`sideGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%"   stopColor={s.mid}  stopOpacity="0.95" />
//                   <stop offset="100%" stopColor={s.dark} stopOpacity="1"    />
//                 </linearGradient>
//               ))}

//               {/* ── Gloss overlay gradient ── */}
//               <linearGradient id="glossGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%"   stopColor="white" stopOpacity="0.28" />
//                 <stop offset="60%"  stopColor="white" stopOpacity="0.06" />
//                 <stop offset="100%" stopColor="white" stopOpacity="0"    />
//               </linearGradient>
//             </defs>

//             {/* ── RENDER EACH SLICE (side + top as one animated group) ── */}
//             {slices.map((slice, i) => {
//               const isHovered = hovered === i
//               const topPath  = describeTopSlice(cx, cy, rx, ry, slice.startAngle, slice.endAngle)
//               const sidePath = describeSidePanel(cx, cy, rx, ry, depth, slice.startAngle, slice.endAngle)

//               // Edge walls for the visible-half slice boundaries
//               const startWall = describeEdgeWall(cx, cy, rx, ry, depth, slice.startAngle)
//               const endWall   = describeEdgeWall(cx, cy, rx, ry, depth, slice.endAngle)

//               const hoverTransform = isHovered
//                 ? `translate(${slice.dx}px, ${slice.dy}px)`
//                 : 'translate(0px, 0px)'

//               // Label position
//               const labelRad = ((slice.midAngle - 90) * Math.PI) / 180
//               const lx = cx + rx * 0.58 * Math.cos(labelRad)
//               const ly = cy + ry * 0.58 * Math.sin(labelRad)

//               return (
//                 <g
//                   key={slice.key}
//                   className="slice-group"
//                   style={{
//                     animationDelay: `${i * 0.11}s`,
//                     transform: hoverTransform,
//                     transformOrigin: `${cx}px ${cy}px`,
//                     transition: 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
//                     cursor: 'pointer',
//                   }}
//                   onMouseEnter={() => setHovered(i)}
//                   onMouseLeave={() => setHovered(null)}
//                 >
//                   {/* Side panel */}
//                   {sidePath && (
//                     <path d={sidePath} fill={`url(#sideGrad-${i})`} />
//                   )}

//                   {/* Edge walls */}
//                   {startWall && (
//                     <path d={startWall} fill={slice.dark} opacity="0.75" />
//                   )}
//                   {endWall && (
//                     <path d={endWall} fill={slice.dark} opacity="0.75" />
//                   )}

//                   {/* Top face */}
//                   <path
//                     d={topPath}
//                     fill={slice.color}
//                     style={{
//                       filter: isHovered
//                         ? `brightness(1.13) drop-shadow(0 4px 14px ${slice.color}66)`
//                         : 'none',
//                       transition: 'filter 0.2s ease',
//                     }}
//                   />

//                   {/* Gloss sheen on top face */}
//                   <path d={topPath} fill="url(#glossGrad)" opacity={isHovered ? 0.4 : 0.2} />

//                   {/* Percentage label (only when slice is large enough) */}
//                   {slice.percentage >= 15 && (
//                     <text
//                       className="slice-label"
//                       x={lx}
//                       y={ly}
//                       textAnchor="middle"
//                       dominantBaseline="middle"
//                       fill="white"
//                       fontSize="11"
//                       fontWeight="700"
//                       style={{
//                         animationDelay: `${i * 0.11 + 0.35}s`,
//                         textShadow: '0 1px 3px rgba(0,0,0,0.5)',
//                         paintOrder: 'stroke',
//                         stroke: 'rgba(0,0,0,0.2)',
//                         strokeWidth: 2.5,
//                       }}
//                     >
//                       {slice.percentage}%
//                     </text>
//                   )}
//                 </g>
//               )
//             })}

//             {/* ── Empty-state ── */}
//             {slices.length === 0 && (
//               <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#F1F5F9" />
//             )}

//             {/* ── Hover tooltip ── */}
//             {hovered !== null && slices[hovered] && (() => {
//               const s = slices[hovered]
//               const tipX = cx
//               const tipY = cy + ry + depth + 14
//               return (
//                 <g style={{ pointerEvents: 'none' }}>
//                   <rect
//                     x={tipX - 52} y={tipY}
//                     width={104} height={36} rx={8}
//                     fill="rgba(15,23,42,0.90)"
//                   />
//                   <text x={tipX} y={tipY + 13}
//                     textAnchor="middle" fill={s.color}
//                     fontSize="10" fontWeight="700"
//                   >
//                     {s.label}
//                   </text>
//                   <text x={tipX} y={tipY + 27}
//                     textAnchor="middle" fill="#CBD5E1"
//                     fontSize="9.5"
//                   >
//                     {s.value} pengiriman · {s.percentage}%
//                   </text>
//                 </g>
//               )
//             })()}
//           </svg>
//         </div>

//         {/* ── Legend ──────────────────────────────────────────────────────── */}
//         <div className="flex w-full flex-col gap-1 sm:pt-4">
//           {PIE_META.map((meta) => {
//             const sliceIdx = slices.findIndex((s) => s.key === meta.key)
//             const slice     = slices[sliceIdx]
//             const isHovered = hovered === sliceIdx
//             const isActive  = sliceIdx !== -1

//             return (
//               <div
//                 key={meta.key}
//                 className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-150 ${
//                   isActive ? 'cursor-pointer' : 'opacity-35 cursor-default'
//                 } ${isHovered ? 'bg-slate-50 shadow-sm' : ''}`}
//                 onMouseEnter={() => isActive && setHovered(sliceIdx)}
//                 onMouseLeave={() => setHovered(null)}
//               >
//                 {/* Color swatch */}
//                 <span
//                   className="block h-3 w-3 flex-shrink-0 rounded-sm transition-transform duration-150"
//                   style={{
//                     backgroundColor: meta.color,
//                     transform: isHovered ? 'scale(1.25)' : 'scale(1)',
//                     boxShadow: isHovered ? `0 2px 6px ${meta.color}80` : 'none',
//                   }}
//                 />

//                 <span className="flex-1 text-xs font-medium text-slate-600">{meta.label}</span>

//                 <span
//                   className="min-w-[20px] text-right text-sm font-bold transition-colors duration-150"
//                   style={{ color: isActive && isHovered ? meta.color : '#1e293b' }}
//                 >
//                   {isActive ? slice.value : 0}
//                 </span>

//                 {isActive && (
//                   <span className="w-9 text-right text-[11px] font-semibold text-slate-400">
//                     {slice.percentage}%
//                   </span>
//                 )}
//                 {!isActive && (
//                   <span className="w-9 text-right text-[11px] text-slate-300">—</span>
//                 )}
//               </div>
//             )
//           })}

//           {/* Total row */}
//           <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
//             <span className="text-xs font-semibold text-slate-500">Total</span>
//             <span className="text-sm font-bold text-slate-800">{grandTotal}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
