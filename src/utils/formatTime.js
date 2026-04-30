export const formatTime = (dateString) => {
  if (!dateString) return "À l'instant";
  
  const date = new Date(dateString);
  const now = new Date();
  
  // On gère les problèmes de désynchronisation entre le client et le serveur
  const diffInSeconds = Math.max(0, Math.floor((now - date) / 1000));
  
  if (diffInSeconds < 60) {
    const s = Math.max(1, diffInSeconds);
    return `il y a ${s} s`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} m`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours} h`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 30) {
    return `il y a ${diffInDays} j`;
  }
  
  // Plus d'un mois (30 jours) : on affiche jj/mm/yyyy
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
