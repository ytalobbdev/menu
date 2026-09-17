/**
 * YTALO QUEIROZ - HUB DE FERRAMENTAS WEB
 * Script de Interatividade, Filtros e Efeitos
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos do DOM
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryChips = document.querySelectorAll('.chip');
  const toolCards = document.querySelectorAll('.tool-card');
  const toolsCounter = document.getElementById('toolsCounter');
  const countAll = document.getElementById('countAll');
  const emptyState = document.getElementById('emptyState');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  
  // Toast & Modal
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const contactModal = document.getElementById('contactModal');
  const openContactInfoBtn = document.getElementById('openContactInfoBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const emailText = document.getElementById('emailText');

  let currentCategory = 'all';
  let searchQuery = '';
  let toastTimeout = null;

  // Atualiza contador total no carregamento
  if (countAll) {
    countAll.textContent = toolCards.length;
  }

  // =========================================================================
  // 1. EFEITO DE SPOTLIGHT / MOUSE GLOW NOS CARDS
  // =========================================================================
  toolCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // =========================================================================
  // 2. FILTRAGEM DE CARDS (BUSCA + CATEGORIAS)
  // =========================================================================
  function filterTools() {
    let visibleCount = 0;
    const query = searchQuery.toLowerCase().trim();

    toolCards.forEach(card => {
      const title = card.querySelector('.tool-title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.tool-description')?.textContent.toLowerCase() || '';
      const tags = card.getAttribute('data-tags') || '';
      const category = card.getAttribute('data-category') || '';
      const link = card.querySelector('.link-text')?.textContent.toLowerCase() || '';

      const matchesSearch = query === '' || 
        title.includes(query) || 
        desc.includes(query) || 
        tags.includes(query) ||
        link.includes(query);

      const matchesCategory = currentCategory === 'all' || category === currentCategory;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        // Pequena animação de entrada
        card.style.animation = 'fadeInCard 0.35s ease forwards';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Atualiza contador e estado vazio
    if (toolsCounter) {
      toolsCounter.textContent = `Exibindo ${visibleCount} de ${toolCards.length} ferramentas`;
    }

    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'flex';
      } else {
        emptyState.style.display = 'none';
      }
    }
  }

  // Evento de Digitação na Busca
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery.length > 0 ? 'flex' : 'none';
      }
      filterTools();
    });
  }

  // Botão de Limpar Busca
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      searchInput.focus();
      filterTools();
    });
  }

  // Botão de Reset no Estado Vazio
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      if (clearSearchBtn) clearSearchBtn.style.display = 'none';
      
      // Reseta chips de categoria para "Todas"
      categoryChips.forEach(c => c.classList.remove('active'));
      const allChip = document.querySelector('.chip[data-category="all"]');
      if (allChip) allChip.classList.add('active');
      currentCategory = 'all';

      filterTools();
    });
  }

  // Filtro por Chips de Categoria
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-category');
      filterTools();
    });
  });

  // =========================================================================
  // 3. ATALHOS DE TECLADO
  // =========================================================================
  document.addEventListener('keydown', (e) => {
    // Ctrl + K ou / foca na busca
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== searchInput)) {
      e.preventDefault();
      searchInput?.focus();
      searchInput?.select();
    }

    // Escape limpa busca ou fecha modal
    if (e.key === 'Escape') {
      if (contactModal && contactModal.classList.contains('active')) {
        closeModal();
      } else if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchQuery = '';
        if (clearSearchBtn) clearSearchBtn.style.display = 'none';
        searchInput.blur();
        filterTools();
      }
    }
  });

  // =========================================================================
  // 4. COPIAR LINK COM NOTIFICAÇÃO TOAST
  // =========================================================================
  function showToast(message, iconClass = 'fa-circle-check') {
    if (!toast || !toastMessage) return;

    const icon = toast.querySelector('.toast-icon');
    if (icon) {
      icon.className = `fa-solid ${iconClass} toast-icon`;
    }

    toastMessage.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = btn.getAttribute('data-url');
      if (!url) return;

      try {
        await navigator.clipboard.writeText(url);
        
        // Efeito visual no botão
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #34d399;"></i>';
        setTimeout(() => {
          btn.innerHTML = originalIcon;
        }, 2000);

        showToast(`Link copiado: ${url}`);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Link copiado para a área de transferência!');
      }
    });
  });

  // =========================================================================
  // 5. MODAL DE CONTATO / INFORMAÇÕES
  // =========================================================================
  function openModal() {
    if (contactModal) {
      contactModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (contactModal) {
      contactModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openContactInfoBtn) {
    openContactInfoBtn.addEventListener('click', openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (contactModal) {
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        closeModal();
      }
    });
  }

  // Copiar E-mail no Modal
  if (copyEmailBtn && emailText) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = emailText.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        showToast('E-mail copiado para a área de transferência!');
        copyEmailBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #34d399;"></i>';
        setTimeout(() => {
          copyEmailBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 2000);
      } catch (err) {
        showToast('E-mail: ' + email);
      }
    });
  }
});

// Animação CSS inline injetada para entrada fluida
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInCard {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
document.head.appendChild(styleSheet);
