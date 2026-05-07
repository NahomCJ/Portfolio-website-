import './TechLoop.css';

const TECH = [
  'devicon-python-original colored',
  'devicon-tensorflow-original colored',
  'devicon-flutter-original colored',
  'devicon-typescript-original colored',
  'devicon-amazonwebservices-plain colored',
  'devicon-docker-original colored',
  'devicon-pandas-original colored',
  'devicon-keras-original colored',
  'devicon-numpy-original colored',
  'devicon-java-original colored',
  'devicon-postgresql-original colored',
  'devicon-matplotlib-plain colored',
  'devicon-scikitlearn-plain colored',
  'devicon-dart-plain colored',
];

const ALL = [...TECH, ...TECH, ...TECH];

export default function TechLoop() {
  return (
    <div className="tl-section">
      <div className="tl-container">
        <div className="tl-track">
          {ALL.map((cls, i) => (
            <div key={i} className="tl-pill" aria-hidden={i >= TECH.length ? 'true' : undefined}>
              <i className={cls} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
