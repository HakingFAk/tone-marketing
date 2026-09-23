# Inventário de ativos incluídos

O diretório `client/public/manus-storage/` contém os ativos originais disponíveis da Tone Market, incluindo logo, fotos de categorias, fotos de produtos de teste, galeria completa da Guitarra rubi, artes da Custom, banner de promoção, foto do proprietário, trilhas ambientes e vídeo demonstrativo. O build copia essa pasta para `dist/public/manus-storage/`.

Os caminhos de mídia existentes foram preservados para a aplicação continuar encontrando os arquivos localmente. Alguns registros administrativos podem apontar para documentos ou vídeos que não fazem parte dos ativos de demonstração; esses itens devem ser enviados novamente pelo administrador ao serviço de armazenamento externo escolhido.

Antes de produção, faça upload do diretório para um bucket privado/público conforme o tipo de mídia, defina uma URL base de CDN e revise permissões de documentos de produto.
