const stars = [
  [8, 18, 0.2], [14, 72, 1.8], [21, 37, 0.9], [28, 82, 2.7],
  [37, 13, 1.3], [43, 59, 3.1], [51, 27, 0.5], [58, 76, 2.1],
  [66, 9, 2.8], [72, 46, 1.1], [79, 84, 3.4], [86, 22, 0.7],
  [91, 61, 2.4], [33, 91, 1.6], [62, 93, 0.3], [95, 38, 3.2],
];

export default function Globe() {
  return (
    <div className="globe-scene" aria-hidden="true">
      {stars.map(([left, top, delay], index) => (
        <span
          key={index}
          className="globe-star"
          style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
        />
      ))}
      <div className="globe-orbit globe-orbit-one" />
      <div className="globe-orbit globe-orbit-two" />
      <div className="globe-body">
        <span className="india-node" />
      </div>
      <span className="node-line" />
    </div>
  );
}
