const DISABLED_MESSAGE =
  'El agente de IA está deshabilitado en este entorno. Conecta una API real para habilitarlo.';

class AgentEngine {
  async run(_userInput: string) {
    return DISABLED_MESSAGE;
  }

  async runStream(_userInput: string, onChunk: (partial: string) => void) {
    onChunk(DISABLED_MESSAGE);
    return DISABLED_MESSAGE;
  }
}

const instancia = new AgentEngine();

export default instancia;
