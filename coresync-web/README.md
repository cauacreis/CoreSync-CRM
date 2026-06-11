# CoreSync CRM

CoreSync CRM é um sistema moderno de gerenciamento de relacionamento com clientes focado em velocidade e em uma experiência de usuário arrojada, adotando o estilo **Neo-Brutalista**.

## Características do Neo-Brutalismo
- **Cores Estouradas**: Tons vibrantes como Verde Limão, Roxo e Vermelho sobre fundos de altíssimo contraste.
- **Bordas Grossas e Sombras Duras**: Sombras pretas (ou brancas, no dark mode) sem desfoque (offset absoluto), dando um aspecto de "recorte de papel".
- **Física de Arraste Pesada (Drag & Drop)**: O Kanban conta com micro-interações de física brutal. Arrastar um card faz com que ele aumente, entorte (rotate) e projete uma sombra colossal de 12px. As colunas alvo acendem para guiar a queda.
- **Sistema de Notificações Global (Toasts)**: Substituímos todos os `alert()` nativos por um sistema de Toasts animado. Ao salvar preferências ou criar leads, blocos gigantes e coloridos caem do topo da tela e desaparecem sozinhos após 3 segundos.
- **Tipografia Pesada**: Títulos sempre em letras maiúsculas e em peso `black`.

## Tecnologias
- React.js + TypeScript
- Vite
- TailwindCSS v4
- i18next (Internacionalização)
- Recharts (Gráficos)
- Context API (Tema, Toasts)

## Arquitetura de Toasts
Os toasts são providos globalmente pelo `ToastContext`. Para utilizá-lo em qualquer componente:
```tsx
import { useToast } from '../contexts/ToastContext';

export function MeuComponente() {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast('Sucesso!', 'success'); // 'success' | 'error' | 'warning'
  };
}
```

## Setup e Rodando Local
1. `npm install`
2. `npm run dev`
