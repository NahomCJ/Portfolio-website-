import './TechLoop.css';

const TECH_ITEMS = [
  { text: 'Flutter', icon: 'devicon-flutter-plain' },
  { text: 'C++', icon: 'devicon-cplusplus-plain' },
  { text: 'Java', icon: 'devicon-java-plain' },
  { text: 'Python', icon: 'devicon-python-plain' },
  { text: 'R', icon: 'devicon-r-plain' },
  { text: 'HTML', icon: 'devicon-html5-plain' },
  { text: 'CSS', icon: 'devicon-css3-plain' },
  { text: 'JavaScript', icon: 'devicon-javascript-plain' },
  { text: 'TypeScript', icon: 'devicon-typescript-plain' },
  { text: 'AWS Cloud', icon: 'devicon-amazonwebservices-original' },
  { text: 'Docker', icon: 'devicon-docker-plain' },
  { text: 'Postgres SQL', icon: 'devicon-postgresql-plain' },
  { text: 'NumPy', icon: 'devicon-numpy-original' },
  { text: 'Pandas', icon: 'devicon-pandas-plain' },
  { text: 'SciPy', icon: '' },
  { text: 'Statsmodels', icon: '' },
  { text: 'Advanced Excel', icon: '' },
  { text: 'Matplotlib', icon: 'devicon-matplotlib-plain' },
  { text: 'Seaborn', icon: '' },
  { text: 'Plotly', icon: '' },
  { text: 'Power BI', icon: '' },
  { text: 'Scikit-learn', icon: 'devicon-scikitlearn-plain' },
  { text: 'PyCharm', icon: 'devicon-pycharm-plain' },
  { text: 'TensorFlow', icon: 'devicon-tensorflow-original' },
  { text: 'Keras', icon: 'devicon-keras-plain' },
];

const ALL = [...TECH_ITEMS, ...TECH_ITEMS, ...TECH_ITEMS];

export default function TechLoop() {
  return (
    <div className="tl-section">
      <div className="tl-container">
        <div className="tl-track">
          {ALL.map((item, i) => (
            <div key={i} className="tl-pill" aria-hidden={i >= TECH_ITEMS.length ? 'true' : undefined}>
              {item.icon ? <i className={item.icon} /> : null}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
