import type { ComponentType } from "react";
import {
  SiPython,
  SiJavascript,
  SiCplusplus,
  SiC,
  SiReact,
  SiFastapi,
  SiPytorch,
  SiTensorflow,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiOpencv,
  SiPostgresql,
  SiGit,
  SiPlotly,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa6";
import { Database, Eye, Brain, Layers, Network, Globe, GitBranch, LineChart } from "lucide-react";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

// Real brand marks where one exists (react-icons); a fitting Lucide glyph
// for concepts and tools that don't have a single canonical logo.
export const skillIcons: Record<string, IconComponent> = {
  Python: SiPython,
  Java: FaJava,
  JavaScript: SiJavascript,
  SQL: Database,
  "C++": SiCplusplus,
  C: SiC,
  React: SiReact,
  FastAPI: SiFastapi,
  PyTorch: SiPytorch,
  TensorFlow: SiTensorflow,
  "scikit-learn": SiScikitlearn,
  Pandas: SiPandas,
  NumPy: SiNumpy,
  OpenCV: SiOpencv,
  PostgreSQL: SiPostgresql,
  AWS: FaAws,
  Git: SiGit,
  "Plotly Dash": SiPlotly,
  Recharts: LineChart,
  "Google Vision API": Eye,
  "Machine Learning": Brain,
  "Deep Learning": Layers,
  "Distributed Systems": Network,
  "REST APIs": Globe,
  "CI/CD": GitBranch,
};
