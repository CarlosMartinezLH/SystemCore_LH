import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const LanApp());
}

class LanApp extends StatelessWidget {
  const LanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LanApp Distribuidora',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF5F7FB),
        primaryColor: const Color(0xFF162A60),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFF162A60),
          secondary: Color(0xFFFACC15),
          surface: Colors.white,
        ),
        fontFamily: 'sans-serif',
      ),
      home: const MainNavigationShell(),
    );
  }
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  int _currentIndex = 0;
  int _selectedFilterPill = 0; // 0: Mis Vales, 1: LanaTienda, 2: Cobranza (Relación), 3: Lanapuntos

  // Clientes y Vales con datos reales de la relación de cobranza de Concepción Montelongo DV 1004
  final List<Map<String, dynamic>> _vales = [
    {
      'id': '13419',
      'noVale': '88412',
      'nombre': 'José Efraín Vázquez Sosa',
      'telefono': '844-329-8471',
      'fechaCanje': '10/10/26',
      'plazo': '2/16',
      'montoPrestado': 1276.96,
      'cuotaQuincenal': 162.98,
      'saldoCorriente': 2167.10,
      'saldoVencido': 19.83,
      'pagoCliente': 162.98,
      'saldoDespuesPago': 2004.12,
      'estado': 'Canjeado SPEI',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 162.98, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 162.98, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 162.98, 'estado': 'POR COBRAR'},
        {'quincena': 4, 'fecha': '08/12/2026', 'cuota': 162.98, 'estado': 'PENDIENTE'},
        {'quincena': 5, 'fecha': '24/12/2026', 'cuota': 162.98, 'estado': 'PENDIENTE'},
        {'quincena': 6, 'fecha': '08/01/2027', 'cuota': 162.98, 'estado': 'PENDIENTE'},
      ]
    },
    {
      'id': '13420',
      'noVale': '88415',
      'nombre': 'Rosa Linda Mora Flores',
      'telefono': '844-551-9022',
      'fechaCanje': '10/10/26',
      'plazo': '2/16',
      'montoPrestado': 3246.56,
      'cuotaQuincenal': 452.80,
      'saldoCorriente': 6020.76,
      'saldoVencido': 0.00,
      'pagoCliente': 452.80,
      'saldoDespuesPago': 5567.96,
      'estado': 'Cobro puntual',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 452.80, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 452.80, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 452.80, 'estado': 'POR COBRAR'},
        {'quincena': 4, 'fecha': '08/12/2026', 'cuota': 452.80, 'estado': 'PENDIENTE'},
      ]
    },
    {
      'id': '13421',
      'noVale': '88418',
      'nombre': 'María Elena Garza Rivas',
      'telefono': '844-120-4389',
      'fechaCanje': '10/10/26',
      'plazo': '2/16',
      'montoPrestado': 2569.28,
      'cuotaQuincenal': 349.38,
      'saldoCorriente': 4645.52,
      'saldoVencido': 42.51,
      'pagoCliente': 349.38,
      'saldoDespuesPago': 4296.14,
      'estado': 'Pendiente cobro',
      'alCorriente': false,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 349.38, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 349.38, 'estado': 'ATRASADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 349.38, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13422',
      'noVale': '88420',
      'nombre': 'Carlos Alberto Dávila Ramos',
      'telefono': '844-893-1104',
      'fechaCanje': '10/10/26',
      'plazo': '2/16',
      'montoPrestado': 1684.96,
      'cuotaQuincenal': 244.92,
      'saldoCorriente': 3256.62,
      'saldoVencido': 0.00,
      'pagoCliente': 244.92,
      'saldoDespuesPago': 3011.70,
      'estado': 'Canjeado SPEI',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 244.92, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 244.92, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 244.92, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13423',
      'noVale': '88425',
      'nombre': 'Sanjuana Castillo Morales',
      'telefono': '844-772-5591',
      'fechaCanje': '10/10/26',
      'plazo': '2/16',
      'montoPrestado': 2853.28,
      'cuotaQuincenal': 388.00,
      'saldoCorriente': 5159.04,
      'saldoVencido': 0.00,
      'pagoCliente': 388.00,
      'saldoDespuesPago': 4771.04,
      'estado': 'Cobro puntual',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 388.00, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 388.00, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 388.00, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13424',
      'noVale': '88430',
      'nombre': 'Brenda Cecilia Treviño Soto',
      'telefono': '844-312-8877',
      'colonia': 'Col. Mirasierra, Saltillo',
      'fechaCanje': '15/10/26',
      'plazo': '4/16',
      'montoPrestado': 4000.00,
      'cuotaQuincenal': 350.00,
      'saldoCorriente': 2600.00,
      'saldoVencido': 0.00,
      'pagoCliente': 350.00,
      'saldoDespuesPago': 2250.00,
      'estado': 'Cobro puntual',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 350.00, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 350.00, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 350.00, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13425',
      'noVale': '88432',
      'nombre': 'Gerardo Antonio Morales Dávila',
      'telefono': '844-662-1099',
      'colonia': 'Col. Bellavista, Saltillo',
      'fechaCanje': '12/10/26',
      'plazo': '2/12',
      'montoPrestado': 2500.00,
      'cuotaQuincenal': 310.00,
      'saldoCorriente': 2190.00,
      'saldoVencido': 62.34,
      'pagoCliente': 310.00,
      'saldoDespuesPago': 1880.00,
      'estado': 'Pendiente cobro',
      'alCorriente': false,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 310.00, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 310.00, 'estado': 'ATRASADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 310.00, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13426',
      'noVale': '88435',
      'nombre': 'Ana Luisa Cárdenas Pérez',
      'telefono': '844-901-4433',
      'colonia': 'Zona Centro, Saltillo',
      'fechaCanje': '18/10/26',
      'plazo': '2/10',
      'montoPrestado': 3500.00,
      'cuotaQuincenal': 420.00,
      'saldoCorriente': 2800.00,
      'saldoVencido': 0.00,
      'pagoCliente': 420.00,
      'saldoDespuesPago': 2380.00,
      'estado': 'Cobro puntual',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '24/10/2026', 'cuota': 420.00, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '08/11/2026', 'cuota': 420.00, 'estado': 'PAGADA'},
        {'quincena': 3, 'fecha': '24/11/2026', 'cuota': 420.00, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13427',
      'noVale': '88438',
      'nombre': 'Laura Patricia Esquivel Reyna',
      'telefono': '844-419-7722',
      'colonia': 'Col. República, Saltillo',
      'fechaCanje': '20/10/26',
      'plazo': '1/8',
      'montoPrestado': 1800.00,
      'cuotaQuincenal': 275.00,
      'saldoCorriente': 1525.00,
      'saldoVencido': 0.00,
      'pagoCliente': 275.00,
      'saldoDespuesPago': 1250.00,
      'estado': 'Canjeado SPEI',
      'alCorriente': true,
      'amortizaciones': [
        {'quincena': 1, 'fecha': '08/11/2026', 'cuota': 275.00, 'estado': 'PAGADA'},
        {'quincena': 2, 'fecha': '24/11/2026', 'cuota': 275.00, 'estado': 'POR COBRAR'},
      ]
    },
    {
      'id': '13428',
      'noVale': '88390',
      'nombre': 'Francisco Javier Ramos Luna',
      'telefono': '844-550-6611',
      'colonia': 'Col. Morelos, Saltillo',
      'fechaCanje': '15/07/26',
      'plazo': '8/8',
      'montoPrestado': 5000.00,
      'cuotaQuincenal': 0.00,
      'saldoCorriente': 0.00,
      'saldoVencido': 0.00,
      'pagoCliente': 0.00,
      'saldoDespuesPago': 0.00,
      'estado': 'Liquidado',
      'alCorriente': true,
      'amortizaciones': []
    },
    {
      'id': '13429',
      'noVale': '',
      'nombre': 'Gloria Estela Rangel Martínez',
      'telefono': '844-123-9988',
      'colonia': 'Col. San Patricio, Saltillo',
      'fechaCanje': '-',
      'plazo': '-',
      'montoPrestado': 3000.00,
      'cuotaQuincenal': 0.00,
      'saldoCorriente': 0.00,
      'saldoVencido': 0.00,
      'pagoCliente': 0.00,
      'saldoDespuesPago': 0.00,
      'estado': 'Prospecto',
      'alCorriente': true,
      'amortizaciones': []
    },
    {
      'id': '13430',
      'noVale': '',
      'nombre': 'Héctor Manuel Zavala Fuentes',
      'telefono': '844-789-2211',
      'colonia': 'Col. Universidad, Saltillo',
      'fechaCanje': '-',
      'plazo': '-',
      'montoPrestado': 4500.00,
      'cuotaQuincenal': 0.00,
      'saldoCorriente': 0.00,
      'saldoVencido': 0.00,
      'pagoCliente': 0.00,
      'saldoDespuesPago': 0.00,
      'estado': 'Prospecto',
      'alCorriente': true,
      'amortizaciones': []
    },
  ];

  bool _isSupportOnline = true;

  final List<Map<String, dynamic>> _tickets = [
    {
      'id': 'TK-1082',
      'asunto': 'Aclaración de abono Vale #88412 vía SPEI STP',
      'categoria': 'Cobranza & SPEI',
      'estatus': 'CHAT ACTIVO',
      'fecha': 'Hace 2 min',
      'mensajes': [
        {
          'sender': 'soporte',
          'nombre': 'Carlos Martínez (Soporte LanAhora)',
          'texto': '¡Hola Concepción! Gusto en saludarte. ¿En qué podemos apoyarte con tu relación de cobranza o dispersión hoy?',
          'hora': '10:12 AM',
        },
        {
          'sender': 'distribuidora',
          'nombre': 'Concepción Montelongo (DV 1004)',
          'texto': 'Hola Carlos, acabo de registrar el comprobante de pago de mi cliente José Efraín Vázquez (Vale #88412 por \$162.98). ¿Me confirmas si ya se liberó en mi línea disponible?',
          'hora': '10:14 AM',
        },
        {
          'sender': 'soporte',
          'nombre': 'Carlos Martínez (Soporte LanAhora)',
          'texto': 'Revisado en tiempo real Concepción. El abono de \$162.98 entró por STP y ya está conciliado en el Sistema Core. Tu línea ValeLana ya tiene \$26,843.10 libres para nuevos vales.',
          'hora': '10:15 AM',
        },
        {
          'sender': 'distribuidora',
          'nombre': 'Concepción Montelongo (DV 1004)',
          'texto': '¡Excelente atención tan rápida! Ya me apareció reflejado en la LanApp. Muchas gracias.',
          'hora': '10:16 AM',
        },
      ]
    },
    {
      'id': 'TK-1080',
      'asunto': 'Solicitud de incremento de línea ValeLana a \$55,000',
      'categoria': 'Línea de Crédito',
      'estatus': 'EN REVISIÓN',
      'fecha': 'Hoy 09:15 AM',
      'mensajes': [
        {
          'sender': 'distribuidora',
          'nombre': 'Concepción Montelongo (DV 1004)',
          'texto': 'Buenos días, ya alcancé el 95% de colocación. ¿Podemos revisar el incremento a Nivel Plata/Oro con mi coordinador José Miguel?',
          'hora': '09:15 AM',
        },
        {
          'sender': 'soporte',
          'nombre': 'Mesa de Crédito LanAhora',
          'texto': 'Hola Concepción, tu historial de pago en las últimas 6 quincenas es impecable. El expediente está en Mesa de Crédito para autorizar \$55,000 hoy.',
          'hora': '09:20 AM',
        },
      ]
    },
    {
      'id': 'TK-1077',
      'asunto': 'Reposición de Valera Física (50 folios nuevos)',
      'categoria': 'Valera Física',
      'estatus': 'RESUELTO',
      'fecha': 'Ayer 18:30',
      'mensajes': [
        {
          'sender': 'distribuidora',
          'nombre': 'Concepción Montelongo (DV 1004)',
          'texto': 'Solicito nueva valera física folios 88450 al 88500 para entregar en sucursal Saltillo.',
          'hora': 'Ayer 17:00',
        },
        {
          'sender': 'soporte',
          'nombre': 'Carlos Martínez (Soporte LanAhora)',
          'texto': 'Valera registrada y entregada por tu coordinador José Miguel con firma de resguardo. Ticket cerrado con éxito.',
          'hora': 'Ayer 18:30',
        },
      ]
    },
  ];

  void _showLiveChatModal(Map<String, dynamic> ticket) {
    final chatTextCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            final List<dynamic> msgs = ticket['mensajes'] ?? [];

            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 14,
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 16,
              ),
              child: SizedBox(
                height: MediaQuery.of(modalCtx).size.height * 0.75,
                child: Column(
                  children: [
                    Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Stack(
                              children: [
                                Container(
                                  width: 42,
                                  height: 42,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF162A60),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: const Icon(Icons.support_agent_rounded, color: Color(0xFFFACC15), size: 24),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    width: 11,
                                    height: 11,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF10B981),
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Carlos Martínez',
                                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF162A60)),
                                ),
                                Row(
                                  children: const [
                                    Text('Soporte LanAhora • ', style: TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                                    Text('En línea ahora', style: TextStyle(fontSize: 10, color: Color(0xFF047857), fontWeight: FontWeight.bold)),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const Divider(height: 16),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Text(ticket['id'] ?? 'TK-1082', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 10.5, color: Color(0xFF162A60))),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              ticket['asunto'] ?? 'Consulta de Soporte',
                              style: const TextStyle(fontSize: 10.5, color: Color(0xFF475569), fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.builder(
                        itemCount: msgs.length,
                        itemBuilder: (context, idx) {
                          final m = msgs[idx];
                          final isMe = m['sender'] == 'distribuidora';

                          return Align(
                            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isMe ? const Color(0xFF162A60) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(18),
                              ),
                              child: Column(
                                crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    m['nombre'] ?? '',
                                    style: TextStyle(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.bold,
                                      color: isMe ? const Color(0xFFFACC15) : const Color(0xFF64748B),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    m['texto'] ?? '',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                      color: isMe ? Colors.white : const Color(0xFF1E293B),
                                      height: 1.3,
                                    ),
                                  ),
                                  const SizedBox(height: 3),
                                  Text(
                                    m['hora'] ?? '',
                                    style: TextStyle(
                                      fontSize: 8.5,
                                      color: isMe ? Colors.white60 : Colors.black38,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: chatTextCtrl,
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                              decoration: const InputDecoration(
                                hintText: 'Escribe tu mensaje a soporte...',
                                hintStyle: TextStyle(fontSize: 11.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.normal),
                                border: InputBorder.none,
                                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.send_rounded, color: Color(0xFF162A60), size: 20),
                            onPressed: () {
                              final txt = chatTextCtrl.text.trim();
                              if (txt.isEmpty) return;

                              final newMsg = {
                                'sender': 'distribuidora',
                                'nombre': 'Concepción Montelongo (DV 1004)',
                                'texto': txt,
                                'hora': 'Justo ahora',
                              };

                              setModalState(() {
                                (ticket['mensajes'] as List).add(newMsg);
                              });
                              chatTextCtrl.clear();

                              Future.delayed(const Duration(milliseconds: 1200), () {
                                if (modalCtx.mounted) {
                                  setModalState(() {
                                    (ticket['mensajes'] as List).add({
                                      'sender': 'soporte',
                                      'nombre': 'Carlos Martínez (Soporte)',
                                      'texto': 'Mensaje recibido Concepción. Ya lo estoy revisando en el sistema Core de Saltillo.',
                                      'hora': 'Justo ahora',
                                    });
                                  });
                                }
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showNuevoTicketModal() {
    final asuntoCtrl = TextEditingController();
    final detalleCtrl = TextEditingController();
    String categoria = 'Cobranza & SPEI';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalCtx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 16,
                bottom: MediaQuery.of(modalCtx).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 5,
                        decoration: BoxDecoration(
                          color: const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Nuevo Ticket de Soporte',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text('CATEGORÍA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: categoria,
                          isExpanded: true,
                          items: const [
                            DropdownMenuItem(value: 'Cobranza & SPEI', child: Text('Cobranza & Dispersión SPEI STP', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                            DropdownMenuItem(value: 'Línea de Crédito', child: Text('Aumento de Línea ValeLana', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                            DropdownMenuItem(value: 'LanaTienda', child: Text('Canje en Comercio LanaTienda', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                            DropdownMenuItem(value: 'Valera Física', child: Text('Reposición de Valera Física', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                            DropdownMenuItem(value: 'Consulta General', child: Text('Consulta General o Aclaración', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                          ],
                          onChanged: (v) {
                            if (v != null) {
                              setModalState(() => categoria = v);
                            }
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('ASUNTO / MOTIVO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: asuntoCtrl,
                      decoration: InputDecoration(
                        hintText: 'Ej. Aclaración abono Vale #88412',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('DETALLE DE LA SOLICITUD', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: detalleCtrl,
                      maxLines: 3,
                      decoration: InputDecoration(
                        hintText: 'Describe lo que necesitas para que el equipo de soporte te asista...',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF162A60),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: () {
                          final asunto = asuntoCtrl.text.trim();
                          if (asunto.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Por favor escribe el asunto del ticket.')),
                            );
                            return;
                          }

                          final newTicket = {
                            'id': 'TK-${1083 + _tickets.length}',
                            'asunto': asunto,
                            'categoria': categoria,
                            'estatus': 'CHAT ACTIVO',
                            'fecha': 'Justo ahora',
                            'mensajes': [
                              {
                                'sender': 'distribuidora',
                                'nombre': 'Concepción Montelongo (DV 1004)',
                                'texto': detalleCtrl.text.trim().isEmpty ? asunto : detalleCtrl.text.trim(),
                                'hora': 'Justo ahora',
                              },
                              {
                                'sender': 'soporte',
                                'nombre': 'Carlos Martínez (Soporte)',
                                'texto': '¡Hola Concepción! Recibimos tu ticket "$asunto". Ya lo estamos atendiendo.',
                                'hora': 'Justo ahora',
                              },
                            ],
                          };

                          setState(() {
                            _tickets.insert(0, newTicket);
                          });
                          Navigator.pop(ctx);
                          _showLiveChatModal(newTicket);
                        },
                        child: const Text('Enviar Ticket e Iniciar Chat', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _navigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  // Abre el modal detallado de seguimiento de un vale
  void _showSeguimientoValeModal(Map<String, dynamic> vale) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header del Vale
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFF162A60),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.receipt_long_rounded, color: Color(0xFFFACC15), size: 22),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Folio Vale #${vale['noVale']}',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                        ),
                        Text('Cliente ID: ${vale['id']} • Canje: ${vale['fechaCanje']}', style: const TextStyle(fontSize: 11, color: Color(0xFF718096))),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.black54),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const Divider(height: 20),

            // Nombre y Teléfono del Cliente
            Text(
              vale['nombre'],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.phone, size: 14, color: Color(0xFF718096)),
                const SizedBox(width: 4),
                Text(vale['telefono'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF718096))),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: vale['alCorriente'] ? const Color(0xFFDCFCE7) : const Color(0xFFFFEDD5),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    vale['estado'],
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: vale['alCorriente'] ? const Color(0xFF166534) : const Color(0xFF9A3412),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Tarjetas de Métricas de Crédito
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Text('Monto Vale', style: TextStyle(fontSize: 9.5, color: Color(0xFF718096))),
                      const SizedBox(height: 2),
                      Text('\$${vale['montoPrestado'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                    ],
                  ),
                  Container(width: 1, height: 26, color: Colors.black12),
                  Column(
                    children: [
                      const Text('Cuota Quincenal', style: TextStyle(fontSize: 9.5, color: Color(0xFF718096))),
                      const SizedBox(height: 2),
                      Text('\$${vale['cuotaQuincenal'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF16A34A))),
                    ],
                  ),
                  Container(width: 1, height: 26, color: Colors.black12),
                  Column(
                    children: [
                      const Text('Saldo Restante', style: TextStyle(fontSize: 9.5, color: Color(0xFF718096))),
                      const SizedBox(height: 2),
                      Text('\$${vale['saldoCorriente'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFE11D48))),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Título Tabla Amortización
            const Text(
              'Tabla de Amortización Quincenal',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
            ),
            const SizedBox(height: 8),

            // Lista de Amortizaciones
            SizedBox(
              height: 170,
              child: ListView.separated(
                itemCount: (vale['amortizaciones'] as List).length,
                separatorBuilder: (_, __) => const Divider(height: 8),
                itemBuilder: (context, i) {
                  final amort = (vale['amortizaciones'] as List)[i];
                  final bool pagada = amort['estado'] == 'PAGADA';
                  final bool atrasada = amort['estado'] == 'ATRASADA';
                  final bool porCobrar = amort['estado'] == 'POR COBRAR';

                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 12,
                            backgroundColor: pagada ? const Color(0xFFDCFCE7) : (atrasada ? const Color(0xFFFFE4E6) : const Color(0xFFE0E7FF)),
                            child: Text(
                              'Q${amort['quincena']}',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                                color: pagada ? const Color(0xFF166534) : (atrasada ? const Color(0xFF9F1239) : const Color(0xFF3730A3)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(amort['fecha'], style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      Text('\$${amort['cuota'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: pagada ? const Color(0xFFDCFCE7) : (atrasada ? const Color(0xFFFFE4E6) : (porCobrar ? const Color(0xFFFEF08A) : const Color(0xFFF1F5F9))),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          amort['estado'],
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                            color: pagada ? const Color(0xFF166534) : (atrasada ? const Color(0xFF9F1239) : (porCobrar ? const Color(0xFF854D0E) : Colors.black54)),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
            const SizedBox(height: 14),

            // Botones de acción del vale
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF22C55E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Recordatorio de cobro enviado por WhatsApp a ${vale['nombre']}'),
                          backgroundColor: const Color(0xFF16A34A),
                        ),
                      );
                    },
                    icon: const Icon(Icons.chat, size: 16),
                    label: const Text('Recordatorio WhatsApp', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF162A60),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: () {
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Comprobante SPEI STP de ${vale['nombre']} generado exitosamente.'),
                          backgroundColor: const Color(0xFF162A60),
                        ),
                      );
                    },
                    icon: const Icon(Icons.picture_as_pdf_rounded, size: 16),
                    label: const Text('Comprobante SPEI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Abre el modal de la Relación de Cobranza Oficial (Core System)
  void _showRelacionCobranzaOficial() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => RelacionCobranzaCoreView(vales: _vales),
      ),
    );
  }

  // Abre el modal de Lanapuntos
  void _showLanapuntosModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.card_giftcard_rounded, color: Color(0xFFEAB308), size: 24),
                    SizedBox(width: 8),
                    Text(
                      'Lanapuntos y Recompensas',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                    ),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFEFCE8),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFFEF08A)),
              ),
              child: Column(
                children: const [
                  Text('TUS LANAPUNTOS ACUMULADOS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Color(0xFF854D0E))),
                  SizedBox(height: 4),
                  Text('16,125 pts', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: Color(0xFF854D0E))),
                  Text('Equivalente a \$300.00 MXN en efectivo', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF16A34A))),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'Tu código de recomendación para nuevas Distribuidoras:',
              style: TextStyle(fontSize: 11, color: Color(0xFF718096)),
            ),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('LANA-CONCE1004', style: TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF162A60))),
                  InkWell(
                    onTap: () {
                      Clipboard.setData(const ClipboardData(text: 'LANA-CONCE1004'));
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Código LANA-CONCE1004 copiado')));
                    },
                    child: const Text('Copiar', style: TextStyle(color: Color(0xFF2563EB), fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF22C55E),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Abriendo WhatsApp para invitar distribuidoras...')));
                },
                icon: const Icon(Icons.share, size: 18),
                label: const Text('Compartir por WhatsApp (\$300 por recomendada)', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Abre vista de LanaTienda Muebles
  void _showLanaTiendaView() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: const [
                    Icon(Icons.storefront_rounded, color: Color(0xFF0284C7), size: 24),
                    SizedBox(width: 8),
                    Text(
                      'LanaTienda Comercios Afiliados',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                    ),
                  ],
                ),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
              ],
            ),
            const Divider(),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F9FF),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('LÍNEA AUTORIZADA LANATIENDA', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF0369A1))),
                      SizedBox(height: 2),
                      Text('\$17,500.00 MXN', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0C4A6E))),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFFE0F2FE), borderRadius: BorderRadius.circular(8)),
                    child: const Text('100% DISPONIBLE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF0284C7))),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Text('Comercios Afiliados en Saltillo:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFF162A60))),
            const SizedBox(height: 8),
            _buildComercioTile('Mueblería La Fama Saltillo', 'Línea blanca, salas y recámaras', Icons.chair_rounded),
            _buildComercioTile('Elektra Centro Saltillo', 'Telefonía y electrodomésticos', Icons.phone_android_rounded),
            _buildComercioTile('Coppel Allende', 'Ropa, calzado y muebles', Icons.shopping_bag_rounded),
            const SizedBox(height: 14),
          ],
        ),
      ),
    );
  }

  Widget _buildComercioTile(String nombre, String sub, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black12),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF0284C7), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(nombre, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF162A60))),
                Text(sub, style: const TextStyle(fontSize: 10, color: Color(0xFF718096))),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, size: 18, color: Colors.black38),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    Widget currentBody;
    switch (_currentIndex) {
      case 1:
        currentBody = RelacionCobranzaCoreView(vales: _vales);
        break;
      case 2:
        currentBody = CreateValeView(
          onDone: () => _navigateToTab(0),
        );
        break;
      case 3:
        currentBody = ClientesListView(
          clientes: _vales,
          onEmitirValeParaCliente: (c) => _navigateToTab(2),
          onVerSeguimiento: (c) => _showSeguimientoValeModal(c),
          onAgregarCliente: (nuevo) {
            setState(() {
              _vales.insert(0, nuevo);
            });
          },
        );
        break;
      case 4:
        currentBody = SoporteView(
          isSupportOnline: _isSupportOnline,
          tickets: _tickets,
          onOpenChat: (ticket) => _showLiveChatModal(ticket),
          onNuevoTicket: () => _showNuevoTicketModal(),
        );
        break;
      case 0:
      default:
        currentBody = DashboardHomeView(
          onMenuTap: () => _scaffoldKey.currentState?.openDrawer(),
          onEmitirVale: () => _navigateToTab(2),
          onVerAgenda: () => _showRelacionCobranzaOficial(),
          onVerClientes: () => _navigateToTab(3),
          onFilterSelected: (index) {
            setState(() => _selectedFilterPill = index);
            if (index == 1) {
              _showLanaTiendaView();
            } else if (index == 2) {
              _showRelacionCobranzaOficial();
            } else if (index == 3) {
              _showLanapuntosModal();
            }
          },
          selectedFilterIndex: _selectedFilterPill,
          onVerSeguimiento: (vale) => _showSeguimientoValeModal(vale),
          clientes: _vales,
        );
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFFF5F7FB),
      // DRAWER COMPLETO FUNCIONAL DE DISTRIBUIDORA
      drawer: Drawer(
        backgroundColor: Colors.white,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF162A60), Color(0xFF1E3A8A)],
                ),
              ),
              currentAccountPicture: Container(
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFFFACC15), Color(0xFFEAB308)]),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                alignment: Alignment.center,
                child: const Text('CM', style: TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF162A60), fontSize: 20)),
              ),
              accountName: const Text('Concepción Montelongo', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              accountEmail: const Text('DV 1004 • Sucursal Saltillo • Nivel PLATA 10%'),
            ),
            ListTile(
              leading: const Icon(Icons.assignment_outlined, color: Color(0xFF162A60)),
              title: const Text('Relación de Cobranza (Core)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('Documento oficial quincenal del corte'),
              onTap: () {
                Navigator.pop(context);
                _showRelacionCobranzaOficial();
              },
            ),
            ListTile(
              leading: const Icon(Icons.monetization_on_outlined, color: Color(0xFF162A60)),
              title: const Text('Mis Vales y Línea ValeLana', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('\$26,843.10 disponible de \$55,000'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 0);
              },
            ),
            ListTile(
              leading: const Icon(Icons.storefront_outlined, color: Color(0xFF0284C7)),
              title: const Text('LanaTienda Muebles y Comercios', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('\$17,500.00 línea disponible'),
              onTap: () {
                Navigator.pop(context);
                _showLanaTiendaView();
              },
            ),
            ListTile(
              leading: const Icon(Icons.card_giftcard_outlined, color: Color(0xFFEAB308)),
              title: const Text('Lanapuntos y Recompensas', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('16,125 pts (\$300.00 MXN)'),
              onTap: () {
                Navigator.pop(context);
                _showLanapuntosModal();
              },
            ),
            ListTile(
              leading: const Icon(Icons.confirmation_number_outlined, color: Color(0xFF162A60)),
              title: const Text('Valera Digital', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('86 folios electrónicos disponibles'),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Valera Digital: 86 folios activos.')));
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.phone_outlined, color: Color(0xFF16A34A)),
              title: const Text('Coordinador Asignado', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              subtitle: const Text('José Miguel González (844-329-8471)'),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 4);
              },
            ),
            ListTile(
              leading: const Icon(Icons.lock_outline, color: Colors.black54),
              title: const Text('Seguridad y PIN de Acceso', style: TextStyle(fontSize: 13)),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.exit_to_app_rounded, color: Colors.red),
              title: const Text('Cerrar Sesión', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 13)),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sesión cerrada correctamente.')));
              },
            ),
          ],
        ),
      ),
      body: currentBody,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 20,
              offset: const Offset(0, -6),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.home_rounded, 'Inicio'),
                _buildNavItem(1, Icons.assignment_outlined, 'Relación'),
                _buildActionButton(2, Icons.add_rounded, 'Emitir'),
                _buildNavItem(3, Icons.people_alt_rounded, 'Clientes'),
                _buildSupportItem(Icons.headset_mic_rounded, 'Soporte'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isSelected = _currentIndex == index;
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? const Color(0xFF162A60) : const Color(0xFFA0AEC0),
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? const Color(0xFF162A60) : const Color(0xFFA0AEC0),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton(int index, IconData icon, String label) {
    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF162A60),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF162A60).withOpacity(0.25),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 18, color: const Color(0xFFFACC15)),
            const SizedBox(width: 5),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportItem(IconData icon, String label) {
    final bool isSelected = _currentIndex == 4;
    return InkWell(
      onTap: () => setState(() => _currentIndex = 4),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: isSelected ? const Color(0xFF162A60) : const Color(0xFFA0AEC0),
                ),
                if (_isSupportOnline)
                  Positioned(
                    top: -2,
                    right: -3,
                    child: Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF10B981).withOpacity(0.6),
                            blurRadius: 4,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? const Color(0xFF162A60) : const Color(0xFFA0AEC0),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// PANTALLA 1: DASHBOARD HOME
// ==========================================
class DashboardHomeView extends StatelessWidget {
  final VoidCallback onMenuTap;
  final VoidCallback onEmitirVale;
  final VoidCallback onVerAgenda;
  final VoidCallback onVerClientes;
  final Function(int) onFilterSelected;
  final int selectedFilterIndex;
  final Function(Map<String, dynamic>) onVerSeguimiento;
  final List<Map<String, dynamic>> clientes;

  const DashboardHomeView({
    super.key,
    required this.onMenuTap,
    required this.onEmitirVale,
    required this.onVerAgenda,
    required this.onVerClientes,
    required this.onFilterSelected,
    required this.selectedFilterIndex,
    required this.onVerSeguimiento,
    required this.clientes,
  });

  @override
  Widget build(BuildContext context) {
    final List<String> filterPills = ['Mis Vales', 'LanaTienda', 'Cobranza', 'Lanapuntos'];

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Bar: Hamburger / Menu & User Avatar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                InkWell(
                  onTap: onMenuTap,
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.notes_rounded, color: Color(0xFF162A60), size: 22),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF162A60).withOpacity(0.08),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.workspace_premium, color: Color(0xFFEAB308), size: 14),
                          SizedBox(width: 4),
                          Text(
                            'PLATA 10%',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF162A60),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFACC15), Color(0xFFEAB308)],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFFEAB308).withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'CM',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF162A60),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Greeting: "¡Hola, Concepción!" & "Que tengas un excelente día"
            const Text(
              '¡Hola, Concepción!',
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: Color(0xFF162A60),
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 2),
            const Text(
              'Distribuidora DV 1004 • Sucursal Saltillo',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: Color(0xFF718096),
              ),
            ),
            const SizedBox(height: 18),

            // Horizontal Filter Pills: [Mis Vales] [LanaTienda] [Cobranza] [Lanapuntos]
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              clipBehavior: Clip.none,
              child: Row(
                children: List.generate(filterPills.length, (index) {
                  final bool isSelected = selectedFilterIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      onTap: () => onFilterSelected(index),
                      borderRadius: BorderRadius.circular(20),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF162A60) : const Color(0xFFE8EDF5),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: const Color(0xFF162A60).withOpacity(0.2),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ]
                              : null,
                        ),
                        child: Text(
                          filterPills[index],
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? Colors.white : const Color(0xFF4A5568),
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 18),

            // HORIZONTAL NAVY CAROUSEL CARDS
            SizedBox(
              height: 185,
              child: ListView(
                scrollDirection: Axis.horizontal,
                clipBehavior: Clip.none,
                children: [
                  // CARD 1: Línea Disponible ValeLana
                  _buildCarouselNavyCard(
                    dateTag: 'LÍNEA DE CRÉDITO',
                    title: 'Línea ValeLana',
                    amount: '\$26,843.10',
                    subtitle: 'Disponible de \$55,000 autorizados',
                    progressValue: 26843.10 / 55000.0,
                    progressLabel: '48.8% libre',
                    isPrimary: true,
                    onTap: onEmitirVale,
                  ),
                  const SizedBox(width: 14),

                  // CARD 2: LanaTienda
                  _buildCarouselNavyCard(
                    dateTag: 'COMERCIOS AFILIADOS',
                    title: 'LanaTienda Muebles',
                    amount: '\$17,500.00',
                    subtitle: 'Línea 100% disponible para compras',
                    progressValue: 1.0,
                    progressLabel: '100% libre',
                    isPrimary: false,
                    onTap: () => onFilterSelected(1),
                  ),
                  const SizedBox(width: 14),

                  // CARD 3: Corte Quincenal
                  _buildCarouselNavyCard(
                    dateTag: 'PRÓXIMO CORTE: 24 NOV',
                    title: 'Cobranza Relación Core',
                    amount: '\$10,460.00',
                    subtitle: 'Comisión ganada: +\$4,589.00',
                    progressValue: 0.72,
                    progressLabel: '72% cobrado',
                    isPrimary: false,
                    onTap: onVerAgenda,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),

            // Section Header: "Seguimiento de Vales" & "Ver todos"
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Seguimiento de Vales',
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF162A60),
                  ),
                ),
                InkWell(
                  onTap: onVerClientes,
                  child: const Text(
                    'Ver todos (14) >',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF162A60),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // WHITE CARDS LIST INTERACTIVA: Al tocar cualquier tarjeta se abre el detalle del vale
            Column(
              children: clientes.map((c) {
                return InkWell(
                  onTap: () => onVerSeguimiento(c),
                  borderRadius: BorderRadius.circular(18),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.03),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        // Navy rounded icon box
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: const Color(0xFF162A60),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(
                            Icons.receipt_long_rounded,
                            color: Color(0xFFFACC15),
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),

                        // Title & Subtitle
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                c['nombre'],
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF162A60),
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Vale #${c['noVale']} • Plazo ${c['plazo']} • Canje ${c['fechaCanje']}',
                                style: const TextStyle(
                                  fontSize: 10.5,
                                  color: Color(0xFF718096),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Amount & Status
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '+\$${c['pagoCliente'].toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF16A34A),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              c['estado'],
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                color: c['alCorriente'] ? const Color(0xFF16A34A) : const Color(0xFFEA580C),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 6),
                        IconButton(
                          icon: const Icon(Icons.more_vert, size: 18, color: Color(0xFFA0AEC0)),
                          onPressed: () => onVerSeguimiento(c),
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCarouselNavyCard({
    required String dateTag,
    required String title,
    required String amount,
    required String subtitle,
    required double progressValue,
    required String progressLabel,
    required bool isPrimary,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 250,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: isPrimary
              ? const LinearGradient(
                  colors: [Color(0xFF162A60), Color(0xFF223E8C)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : const LinearGradient(
                  colors: [Color(0xFF1B2B5A), Color(0xFF121E42)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF162A60).withOpacity(0.28),
              blurRadius: 14,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top Tag
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    dateTag,
                    style: const TextStyle(
                      fontSize: 8.5,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFFACC15),
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Icon(
                  isPrimary ? Icons.monetization_on : Icons.storefront,
                  color: isPrimary ? const Color(0xFFFACC15) : const Color(0xFF38BDF8),
                  size: 18,
                ),
              ],
            ),

            // Title & Amount
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  amount,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 9.5,
                    color: Colors.white60,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),

            // Progress Bar & Percentage
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Disponible', style: TextStyle(fontSize: 9, color: Colors.white60)),
                    Text(progressLabel, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
                  ],
                ),
                const SizedBox(height: 5),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: progressValue.clamp(0.0, 1.0),
                    minHeight: 5,
                    backgroundColor: Colors.white12,
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFACC15)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// PANTALLA OFICIAL: RELACIÓN DE COBRANZA DEL CORE
// (RÉPLICA EXACTA DE RelacionCobranzaModal.tsx)
// ==========================================
class RelacionCobranzaCoreView extends StatelessWidget {
  final List<Map<String, dynamic>> vales;

  const RelacionCobranzaCoreView({super.key, required this.vales});

  @override
  Widget build(BuildContext context) {
    // Totales calculados según la lógica del Core
    double totalSaldoCorriente = 0;
    double totalSaldoVencido = 0;
    double totalPagoCliente = 0;
    double totalSaldoDespues = 0;

    for (var v in vales) {
      totalSaldoCorriente += (v['saldoCorriente'] as double);
      totalSaldoVencido += (v['saldoVencido'] as double);
      totalPagoCliente += (v['pagoCliente'] as double);
      totalSaldoDespues += (v['saldoDespuesPago'] as double);
    }

    // Escala de bonificaciones del Core (Escala 30-15)
    final List<Map<String, dynamic>> bonificaciones = [
      {'fecha': '14/11/2026', 'porc': '18.00%', 'neto': 4682.00, 'banorte': 4682.00, 'paynet': 4693.00},
      {'fecha': '15/11/2026', 'porc': '18.00%', 'neto': 4682.00, 'banorte': 4682.00, 'paynet': 4693.00},
      {'fecha': '16/11/2026', 'porc': '17.00%', 'neto': 4716.00, 'banorte': 4716.00, 'paynet': 4727.00},
      {'fecha': '17/11/2026', 'porc': '16.00%', 'neto': 4749.00, 'banorte': 4749.00, 'paynet': 4760.00},
      {'fecha': '18/11/2026', 'porc': '15.00%', 'neto': 4783.00, 'banorte': 4783.00, 'paynet': 4794.00},
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: const Text(
          'Relación de Cobranza Quincenal',
          style: TextStyle(color: Color(0xFF162A60), fontWeight: FontWeight.w900, fontSize: 16),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF162A60)),
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Descargando Relación de Cobranza en PDF...')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Compartiendo ficha de cobranza con la distribuidora...')),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Bloque de Identidad Core: LanAhora Sucursal Saltillo y Fechas de Corte
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.black12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF162A60), Color(0xFF1D4ED8)]),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Text('LH', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('SUCURSAL OPERATIVA', style: TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF718096))),
                          Text('SALTILLO', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                          Text('Región Sureste • Coahuila', style: TextStyle(fontSize: 10, color: Color(0xFF718096))),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.black12),
                        ),
                        child: const Text('CORTE: 08/NOV/2026', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Color(0xFF162A60))),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDBEAFE),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('LÍMITE: 18/NOV/2026', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Color(0xFF1E40AF))),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 2. Datos de la Distribuidora (Concepción Montelongo DV 1004)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEFF6FF),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFBFDBFE)),
                            ),
                            child: const Text('DV #1004', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF1D4ED8))),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('NIVEL PLATA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF334155))),
                          ),
                        ],
                      ),
                      Row(
                        children: const [
                          Icon(Icons.stars, color: Color(0xFFEAB308), size: 16),
                          SizedBox(width: 4),
                          Text('16,125.00 pts', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('CONCEPCIÓN MONTELONGO', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                  const SizedBox(height: 2),
                  const Text('CALLE VICTORIA 421 ZONA CENTRO, SALTILLO, COAHUILA', style: TextStyle(fontSize: 10, color: Color(0xFF718096))),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // 3. Tarjetas de Líneas de Crédito Core
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('VALE LANA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF718096))),
                        SizedBox(height: 2),
                        Text('\$55,000.00', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                        Text('\$26,843.10 disp.', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('LANATIENDA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF718096))),
                        SizedBox(height: 2),
                        Text('\$17,500.00', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                        Text('\$17,500.00 disp.', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.black12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('CRÉD. PERSONAL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF718096))),
                        SizedBox(height: 2),
                        Text('\$15,000.00', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                        Text('\$15,000.00 disp.', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // 4. Tabla: Restructura Cliente Final (Formato Core Oficial)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                      border: Border(bottom: BorderSide(color: Colors.black12)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            CircleAvatar(radius: 4, backgroundColor: Color(0xFF1D4ED8)),
                            SizedBox(width: 8),
                            Text('RESTRUCTURA CLIENTE FINAL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                          ],
                        ),
                        Text('${vales.length} registros', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF718096))),
                      ],
                    ),
                  ),

                  // Lista scrolleable horizontalmente para todas las columnas oficiales del Core
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowHeight: 36,
                      dataRowHeight: 44,
                      headingTextStyle: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.w900, color: Color(0xFF475569)),
                      dataTextStyle: const TextStyle(fontSize: 10.5, fontFamily: 'monospace'),
                      columns: const [
                        DataColumn(label: Text('CANJE')),
                        DataColumn(label: Text('NO VALE')),
                        DataColumn(label: Text('CLIENTE FINAL')),
                        DataColumn(label: Text('PLAZO')),
                        DataColumn(label: Text('VALOR VALE')),
                        DataColumn(label: Text('SALDO CORRIENTE')),
                        DataColumn(label: Text('SALDO VENCIDO')),
                        DataColumn(label: Text('PAGO CLIENTE')),
                        DataColumn(label: Text('SALDO DESPUÉS')),
                      ],
                      rows: vales.map((v) {
                        return DataRow(
                          cells: [
                            DataCell(Text(v['fechaCanje'])),
                            DataCell(Text(v['noVale'], style: const TextStyle(fontWeight: FontWeight.bold))),
                            DataCell(Text(v['nombre'], style: const TextStyle(fontFamily: 'sans-serif', fontWeight: FontWeight.bold))),
                            DataCell(Text(v['plazo'])),
                            DataCell(Text('\$${v['montoPrestado'].toStringAsFixed(2)}')),
                            DataCell(Text('\$${v['saldoCorriente'].toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold))),
                            DataCell(Text(
                              '\$${v['saldoVencido'].toStringAsFixed(2)}',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: (v['saldoVencido'] as double) > 0 ? Colors.red : Colors.black45,
                              ),
                            )),
                            DataCell(Text(
                              '\$${v['pagoCliente'].toStringAsFixed(2)}',
                              style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF1D4ED8)),
                            )),
                            DataCell(Text('\$${v['saldoDespuesPago'].toStringAsFixed(2)}')),
                          ],
                        );
                      }).toList(),
                    ),
                  ),

                  // Subtotal Cliente Final
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(18)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL RESTRUCTURA CLIENTE FINAL:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF334155))),
                        Text(
                          'PAGO TOTAL: \$${totalPagoCliente.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF1D4ED8)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 5. Totales Generales de la Cartera
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF162A60),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('TOTAL CARTERA COBRADA', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                      Text('${vales.length} Registros Activos', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12)),
                    ],
                  ),
                  const Divider(color: Colors.white24, height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('SALDO VENCIDO', style: TextStyle(color: Colors.white60, fontSize: 9.5)),
                          Text('\$${totalSaldoVencido.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFFFDA4AF), fontWeight: FontWeight.w900, fontSize: 13)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('PAGO REQUERIDO AL CORTE', style: TextStyle(color: Color(0xFFFACC15), fontSize: 10, fontWeight: FontWeight.bold)),
                          Text('\$${totalPagoCliente.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // 6. Escala de Bonificaciones por Pronto Pago (Escala oficial 30-15 del Core)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: Colors.black12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
                      border: Border(bottom: BorderSide(color: Colors.black12)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('BONIFICACIONES POR PRONTO PAGO', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                        Text('Escala oficial calculada sobre el total de la relación', style: TextStyle(fontSize: 10, color: Color(0xFF718096))),
                      ],
                    ),
                  ),

                  // Tabla de escala
                  Table(
                    border: TableBorder.all(color: Colors.black12, width: 0.5),
                    children: [
                      const TableRow(
                        decoration: BoxDecoration(color: Color(0xFFF1F5F9)),
                        children: [
                          Padding(padding: EdgeInsets.all(6), child: Text('Fecha Límite', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                          Padding(padding: EdgeInsets.all(6), child: Text('% Dcto', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                          Padding(padding: EdgeInsets.all(6), child: Text('Neto a Pagar', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                          Padding(padding: EdgeInsets.all(6), child: Text('Banorte / STP', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                        ],
                      ),
                      ...bonificaciones.map((b) => TableRow(
                        children: [
                          Padding(padding: const EdgeInsets.all(7), child: Text(b['fecha'], style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold), textAlign: TextAlign.center)),
                          Padding(padding: const EdgeInsets.all(7), child: Text(b['porc'], style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: Color(0xFF16A34A)), textAlign: TextAlign.center)),
                          Padding(padding: const EdgeInsets.all(7), child: Text('\$${b['neto'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800), textAlign: TextAlign.center)),
                          Padding(padding: const EdgeInsets.all(7), child: Text('\$${b['banorte'].toStringAsFixed(2)}', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: Color(0xFF162A60)), textAlign: TextAlign.center)),
                        ],
                      )),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// PANTALLA: EMITIR NUEVO VALE
// ==========================================
class CreateValeView extends StatefulWidget {
  final VoidCallback onDone;

  const CreateValeView({super.key, required this.onDone});

  @override
  State<CreateValeView> createState() => _CreateValeViewState();
}

class _CreateValeViewState extends State<CreateValeView> {
  int _selectedMontoIndex = 1;
  final List<double> _montos = [1000, 2000, 3000, 4000, 5000, 6000];

  int _selectedPlazoIndex = 1;
  final List<String> _plazos = ['4 quincenas', '6 quincenas', '8 quincenas', '10 quincenas', '12 quincenas'];

  String _selectedCliente = 'José Efraín Vázquez Sosa (13419)';

  @override
  Widget build(BuildContext context) {
    final double monto = _montos[_selectedMontoIndex];
    final int numQuincenas = int.parse(_plazos[_selectedPlazoIndex].split(' ')[0]);
    final double pagoQuincenal = (monto * 1.19) / numQuincenas;

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.only(left: 20, right: 20, top: 44, bottom: 24),
          decoration: const BoxDecoration(color: Color(0xFF162A60)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    onTap: widget.onDone,
                    child: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                  ),
                  const Text('Otorgar Vale Digital', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
                  const SizedBox(width: 18),
                ],
              ),
              const SizedBox(height: 20),
              const Text('CLIENTE ASIGNADO', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Color(0xFFFACC15), letterSpacing: 0.8)),
              const SizedBox(height: 4),
              Text(_selectedCliente, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Colors.white)),
              const SizedBox(height: 12),
              const Text('FECHA DE EMISIÓN', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w800, color: Colors.white60, letterSpacing: 0.8)),
              const SizedBox(height: 2),
              const Text('19 Noviembre 2026 • Canje SPEI STP Inmediato', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white)),
            ],
          ),
        ),
        Expanded(
          child: Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFF5F7FB),
              borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selecciona el Monto a Prestar', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: List.generate(_montos.length, (idx) {
                      final bool isSelected = _selectedMontoIndex == idx;
                      return InkWell(
                        onTap: () => setState(() => _selectedMontoIndex = idx),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF162A60) : Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: isSelected ? const Color(0xFF162A60) : Colors.black12),
                          ),
                          child: Text(
                            '\$${_montos[idx].toStringAsFixed(0)} MXN',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? Colors.white : const Color(0xFF162A60),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  const Text('Plazo en Quincenas', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: List.generate(_plazos.length, (idx) {
                      final bool isSelected = _selectedPlazoIndex == idx;
                      return InkWell(
                        onTap: () => setState(() => _selectedPlazoIndex = idx),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF162A60) : const Color(0xFFE8EDF5),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            _plazos[idx],
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? Colors.white : const Color(0xFF4A5568),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 3)),
                      ],
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Pago por quincena:', style: TextStyle(fontSize: 13, color: Color(0xFF718096))),
                            Text('\$${pagoQuincenal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF162A60))),
                          ],
                        ),
                        const Divider(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: const [
                            Text('Canje de dinero:', style: TextStyle(fontSize: 12, color: Color(0xFF718096))),
                            Text('SPEI 24/7 STP Instantáneo', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF16A34A))),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF162A60),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(26)),
                        elevation: 4,
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('¡Vale de \$${monto.toStringAsFixed(0)} emitido exitosamente con folio STP!'),
                            backgroundColor: const Color(0xFF16A34A),
                          ),
                        );
                        widget.onDone();
                      },
                      child: const Text('Emitir Vale Digital Ahora', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ==========================================
// PANTALLA: DIRECTORIO DE CLIENTES (CON FILTROS Y NUEVO CLIENTE)
// ==========================================
class ClientesListView extends StatefulWidget {
  final List<Map<String, dynamic>> clientes;
  final Function(Map<String, dynamic>) onEmitirValeParaCliente;
  final Function(Map<String, dynamic>) onVerSeguimiento;
  final Function(Map<String, dynamic>)? onAgregarCliente;

  const ClientesListView({
    super.key,
    required this.clientes,
    required this.onEmitirValeParaCliente,
    required this.onVerSeguimiento,
    this.onAgregarCliente,
  });

  @override
  State<ClientesListView> createState() => _ClientesListViewState();
}

class _ClientesListViewState extends State<ClientesListView> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedFilter = 'Todos'; // 'Todos', 'Al Corriente', 'Con Atraso', 'Prospectos', 'Liquidados'

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  int get _countTodos => widget.clientes.length;

  int get _countAlCorriente => widget.clientes.where((c) {
    final saldoVencido = (c['saldoVencido'] as num?)?.toDouble() ?? 0.0;
    final estado = c['estado']?.toString() ?? '';
    final noVale = c['noVale']?.toString() ?? '';
    return c['alCorriente'] == true && saldoVencido == 0.0 && estado != 'Liquidado' && estado != 'Prospecto' && noVale.isNotEmpty;
  }).length;

  int get _countConAtraso => widget.clientes.where((c) {
    final saldoVencido = (c['saldoVencido'] as num?)?.toDouble() ?? 0.0;
    return saldoVencido > 0.0 || c['alCorriente'] == false;
  }).length;

  int get _countProspectos => widget.clientes.where((c) {
    final estado = c['estado']?.toString() ?? '';
    final noVale = c['noVale']?.toString() ?? '';
    return estado == 'Prospecto' || noVale.isEmpty;
  }).length;

  int get _countLiquidados => widget.clientes.where((c) {
    final estado = c['estado']?.toString() ?? '';
    final saldoCorriente = (c['saldoCorriente'] as num?)?.toDouble() ?? 0.0;
    return estado == 'Liquidado' || (saldoCorriente == 0.0 && estado != 'Prospecto');
  }).length;

  List<Map<String, dynamic>> get _filteredClientes {
    final query = _searchController.text.toLowerCase().trim();
    return widget.clientes.where((c) {
      // 1. Text Search
      if (query.isNotEmpty) {
        final nombre = (c['nombre'] ?? '').toString().toLowerCase();
        final id = (c['id'] ?? '').toString().toLowerCase();
        final tel = (c['telefono'] ?? '').toString().toLowerCase();
        final col = (c['colonia'] ?? '').toString().toLowerCase();
        final vale = (c['noVale'] ?? '').toString().toLowerCase();
        if (!nombre.contains(query) && !id.contains(query) && !tel.contains(query) && !col.contains(query) && !vale.contains(query)) {
          return false;
        }
      }

      // 2. Filter Pills
      final saldoVencido = (c['saldoVencido'] as num?)?.toDouble() ?? 0.0;
      final estado = c['estado']?.toString() ?? '';
      final noVale = c['noVale']?.toString() ?? '';
      final saldoCorriente = (c['saldoCorriente'] as num?)?.toDouble() ?? 0.0;

      if (_selectedFilter == 'Al Corriente') {
        return c['alCorriente'] == true && saldoVencido == 0.0 && estado != 'Liquidado' && estado != 'Prospecto' && noVale.isNotEmpty;
      } else if (_selectedFilter == 'Con Atraso') {
        return saldoVencido > 0.0 || c['alCorriente'] == false;
      } else if (_selectedFilter == 'Prospectos') {
        return estado == 'Prospecto' || noVale.isEmpty;
      } else if (_selectedFilter == 'Liquidados') {
        return estado == 'Liquidado' || (saldoCorriente == 0.0 && estado != 'Prospecto');
      }

      return true; // 'Todos'
    }).toList();
  }

  void _showNuevoClienteModal(BuildContext context) {
    final nombreCtrl = TextEditingController();
    final telefonoCtrl = TextEditingController();
    final coloniaCtrl = TextEditingController();
    final limiteCtrl = TextEditingController(text: '3,000');
    String estatusSeleccionado = 'PROSPECTO';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (modalContext, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 16,
                bottom: MediaQuery.of(modalContext).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 44,
                        height: 5,
                        decoration: BoxDecoration(
                          color: const Color(0xFFCBD5E1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF162A60),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(Icons.person_add_alt_1, color: Color(0xFFFACC15), size: 20),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text(
                                  'Nuevo Cliente Final',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                                ),
                                Text(
                                  'Cartera Concepción Montelongo DV 1004',
                                  style: TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Nombre Completo
                    const Text('NOMBRE COMPLETO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: nombreCtrl,
                      textCapitalization: TextCapitalization.words,
                      decoration: InputDecoration(
                        hintText: 'Ej. Marisela Rendón Zapata',
                        prefixIcon: const Icon(Icons.person_outline, size: 20, color: Color(0xFF64748B)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Teléfono WhatsApp
                    const Text('TELÉFONO CELULAR (WHATSAPP)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: telefonoCtrl,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        hintText: 'Ej. 844-192-3344',
                        prefixIcon: const Icon(Icons.phone_outlined, size: 20, color: Color(0xFF64748B)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Colonia / Domicilio en Saltillo
                    const Text('COLONIA O DOMICILIO (SALTILLO)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: coloniaCtrl,
                      decoration: InputDecoration(
                        hintText: 'Ej. Col. Mirasierra, Saltillo, Coah.',
                        prefixIcon: const Icon(Icons.location_on_outlined, size: 20, color: Color(0xFF64748B)),
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Límite Sugerido y Estatus Inicial
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('LÍMITE SUGERIDO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                              const SizedBox(height: 6),
                              TextField(
                                controller: limiteCtrl,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  prefixText: '\$ ',
                                  prefixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF162A60)),
                                  filled: true,
                                  fillColor: const Color(0xFFF8FAFC),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF162A60), width: 1.5)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('ESTATUS INICIAL', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF162A60), letterSpacing: 0.5)),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: estatusSeleccionado,
                                    isExpanded: true,
                                    items: const [
                                      DropdownMenuItem(value: 'PROSPECTO', child: Text('Prospecto', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                                      DropdownMenuItem(value: 'APROBADO', child: Text('Aprobado', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.green))),
                                    ],
                                    onChanged: (v) {
                                      if (v != null) {
                                        setModalState(() {
                                          estatusSeleccionado = v;
                                        });
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Botón Guardar
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF162A60),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 2,
                        ),
                        onPressed: () {
                          final nombre = nombreCtrl.text.trim();
                          if (nombre.isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Por favor ingresa el nombre del cliente.')),
                            );
                            return;
                          }
                          final rawLimite = limiteCtrl.text.replaceAll(',', '').replaceAll(r'$', '').trim();
                          final limiteVal = double.tryParse(rawLimite) ?? 3000.0;
                          final nuevoId = '${13430 + widget.clientes.length + 1}';
                          final nuevoValeFolio = estatusSeleccionado == 'APROBADO' ? '${88440 + widget.clientes.length}' : '';

                          final nuevoCliente = {
                            'id': nuevoId,
                            'noVale': nuevoValeFolio,
                            'nombre': nombre,
                            'telefono': telefonoCtrl.text.trim().isEmpty ? '844-000-0000' : telefonoCtrl.text.trim(),
                            'colonia': coloniaCtrl.text.trim().isEmpty ? 'Saltillo, Coah.' : coloniaCtrl.text.trim(),
                            'fechaCanje': estatusSeleccionado == 'APROBADO' ? '19/11/26' : '-',
                            'plazo': estatusSeleccionado == 'APROBADO' ? '4/16' : '-',
                            'montoPrestado': limiteVal,
                            'cuotaQuincenal': estatusSeleccionado == 'APROBADO' ? (limiteVal / 8) : 0.0,
                            'saldoCorriente': estatusSeleccionado == 'APROBADO' ? limiteVal : 0.0,
                            'saldoVencido': 0.0,
                            'pagoCliente': estatusSeleccionado == 'APROBADO' ? (limiteVal / 8) : 0.0,
                            'saldoDespuesPago': 0.0,
                            'estado': estatusSeleccionado == 'APROBADO' ? 'Cobro puntual' : 'Prospecto',
                            'alCorriente': true,
                            'amortizaciones': estatusSeleccionado == 'APROBADO'
                                ? [
                                    {'quincena': 1, 'fecha': '24/11/2026', 'cuota': (limiteVal / 8), 'estado': 'POR COBRAR'},
                                  ]
                                : [],
                          };

                          widget.onAgregarCliente?.call(nuevoCliente);
                          Navigator.pop(ctx);
                          setState(() {
                            _selectedFilter = 'Todos';
                            _searchController.clear();
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: const Color(0xFF047857),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              content: Row(
                                children: [
                                  const Icon(Icons.check_circle, color: Colors.white, size: 20),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '¡$nombre agregada con éxito a tu cartera!',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: const [
                            Icon(Icons.save, color: Color(0xFFFACC15), size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Guardar Cliente en Cartera',
                              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildFilterPill(String title, int count, Color activeColor) {
    final isSelected = _selectedFilter == title;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = title),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF162A60) : const Color(0xFFE8EDF5),
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [BoxShadow(color: const Color(0xFF162A60).withOpacity(0.2), blurRadius: 4, offset: const Offset(0, 2))]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                color: isSelected ? Colors.white : const Color(0xFF475569),
              ),
            ),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFFACC15) : const Color(0xFFCBD5E1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 9.5,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? const Color(0xFF162A60) : const Color(0xFF1E293B),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filteredClientes;

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // HEADER SUPERIOR
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Mis Clientes',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF162A60),
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      'Distribuidora DV 1004 • ${widget.clientes.length} clientas',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _showNuevoClienteModal(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF162A60),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 1,
                  ),
                  icon: const Icon(Icons.add_circle, color: Color(0xFFFACC15), size: 16),
                  label: const Text(
                    'Nuevo',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                  ),
                ),
              ],
            ),
          ),

          // BARRA DE BÚSQUEDA
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 4, offset: const Offset(0, 1)),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (_) => setState(() {}),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                decoration: InputDecoration(
                  hintText: 'Buscar por nombre, ID, vale o colonia...',
                  hintStyle: const TextStyle(fontSize: 11.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.normal),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF64748B), size: 20),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close, size: 16, color: Color(0xFF94A3B8)),
                          onPressed: () {
                            _searchController.clear();
                            setState(() {});
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // FILTROS HORIZONTALES (Pills con conteo)
          Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 8),
            child: SizedBox(
              height: 36,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  _buildFilterPill('Todos', _countTodos, const Color(0xFF162A60)),
                  _buildFilterPill('Al Corriente', _countAlCorriente, const Color(0xFF059669)),
                  _buildFilterPill('Con Atraso', _countConAtraso, const Color(0xFFDC2626)),
                  _buildFilterPill('Prospectos', _countProspectos, const Color(0xFF0284C7)),
                  _buildFilterPill('Liquidados', _countLiquidados, const Color(0xFF64748B)),
                ],
              ),
            ),
          ),

          // LISTA DE CLIENTES
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.person_search_outlined, size: 54, color: Color(0xFFCBD5E1)),
                          const SizedBox(height: 12),
                          const Text(
                            'No se encontraron clientes',
                            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF1E293B)),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _searchController.text.isNotEmpty
                                ? 'No hay resultados que coincidan con "${_searchController.text}"'
                                : 'No hay clientas registradas en la categoría "$_selectedFilter"',
                            textAlign: TextAlign.center,
                            style: const TextStyle(fontSize: 11.5, color: Color(0xFF64748B)),
                          ),
                          const SizedBox(height: 14),
                          TextButton(
                            onPressed: () {
                              _searchController.clear();
                              setState(() => _selectedFilter = 'Todos');
                            },
                            child: const Text('Restablecer Filtros', style: TextStyle(fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final c = filtered[index];
                      final saldoVencido = (c['saldoVencido'] as num?)?.toDouble() ?? 0.0;
                      final saldoCorriente = (c['saldoCorriente'] as num?)?.toDouble() ?? 0.0;
                      final cuota = (c['cuotaQuincenal'] as num?)?.toDouble() ?? 0.0;
                      final estado = c['estado']?.toString() ?? '';
                      final isAtrasado = saldoVencido > 0.0 || c['alCorriente'] == false;
                      final isProspecto = estado == 'Prospecto' || (c['noVale'] ?? '') == '';
                      final isLiquidado = estado == 'Liquidado' || (saldoCorriente == 0.0 && !isProspecto);

                      Color badgeBg;
                      Color badgeFg;
                      String badgeText;

                      if (isAtrasado) {
                        badgeBg = const Color(0xFFFEE2E2);
                        badgeFg = const Color(0xFFDC2626);
                        badgeText = 'ATRASO \$${saldoVencido.toStringAsFixed(2)}';
                      } else if (isProspecto) {
                        badgeBg = const Color(0xFFFEF3C7);
                        badgeFg = const Color(0xFFD97706);
                        badgeText = 'PROSPECTO';
                      } else if (isLiquidado) {
                        badgeBg = const Color(0xFFF1F5F9);
                        badgeFg = const Color(0xFF64748B);
                        badgeText = 'LIQUIDADO';
                      } else {
                        badgeBg = const Color(0xFFDCFCE7);
                        badgeFg = const Color(0xFF15803D);
                        badgeText = 'AL CORRIENTE';
                      }

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.025), blurRadius: 6, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: InkWell(
                          onTap: () {
                            if (!isProspecto) {
                              widget.onVerSeguimiento(c);
                            } else {
                              widget.onEmitirValeParaCliente(c);
                            }
                          },
                          borderRadius: BorderRadius.circular(20),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Avatar
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        color: isAtrasado
                                            ? const Color(0xFFFEE2E2)
                                            : isProspecto
                                                ? const Color(0xFFFEF3C7)
                                                : const Color(0xFF162A60),
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      child: Icon(
                                        isProspecto ? Icons.person_add_alt : Icons.person,
                                        color: isAtrasado
                                            ? const Color(0xFFDC2626)
                                            : isProspecto
                                                ? const Color(0xFFD97706)
                                                : const Color(0xFFFACC15),
                                        size: 22,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    // Info
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  c['nombre'],
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.w900,
                                                    fontSize: 13.5,
                                                    color: Color(0xFF162A60),
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              const SizedBox(width: 6),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 6.5, vertical: 2.5),
                                                decoration: BoxDecoration(
                                                  color: badgeBg,
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  badgeText,
                                                  style: TextStyle(
                                                    fontSize: 8.5,
                                                    fontWeight: FontWeight.w900,
                                                    color: badgeFg,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            'ID: ${c['id']} • ${c['telefono']} • ${c['colonia'] ?? 'Saltillo'}',
                                            style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),

                                const SizedBox(height: 10),
                                const Divider(height: 1, color: Color(0xFFF1F5F9)),
                                const SizedBox(height: 8),

                                // Fila Inferior: Métricas y Botones
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    if (!isProspecto && !isLiquidado) ...[
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Vale #${c['noVale']} • Plazo ${c['plazo']}',
                                            style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                '\$${saldoCorriente.toStringAsFixed(2)}',
                                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                '(\$${cuota.toStringAsFixed(2)}/qna)',
                                                style: const TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.bold),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ] else if (isProspecto) ...[
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const Text(
                                            'Límite Sugerido',
                                            style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                          ),
                                          Text(
                                            '\$${((c['montoPrestado'] as num?)?.toDouble() ?? 3000.0).toStringAsFixed(2)} MXN',
                                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFFD97706)),
                                          ),
                                        ],
                                      ),
                                    ] else ...[
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Vale #${c['noVale']} • Finalizado',
                                            style: const TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                          ),
                                          const Text(
                                            'Saldo \$0.00 • Excelente Historial',
                                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Color(0xFF059669)),
                                          ),
                                        ],
                                      ),
                                    ],

                                    // Botones de Acción
                                    Row(
                                      children: [
                                        if (!isProspecto)
                                          TextButton(
                                            onPressed: () => widget.onVerSeguimiento(c),
                                            style: TextButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                              minimumSize: Size.zero,
                                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                            ),
                                            child: const Text(
                                              'Ver Ficha',
                                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF162A60)),
                                            ),
                                          ),
                                        const SizedBox(width: 4),
                                        ElevatedButton(
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: const Color(0xFF162A60),
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            minimumSize: Size.zero,
                                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                          ),
                                          onPressed: () => widget.onEmitirValeParaCliente(c),
                                          child: Text(
                                            isProspecto ? '+ Emitir' : 'Prestar',
                                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}


// ==========================================
// PANTALLA: SOPORTE Y MESA DE AYUDA EN LÍNEA
// ==========================================
class SoporteView extends StatefulWidget {
  final bool isSupportOnline;
  final List<Map<String, dynamic>> tickets;
  final Function(Map<String, dynamic>) onOpenChat;
  final VoidCallback onNuevoTicket;

  const SoporteView({
    Key? key,
    required this.isSupportOnline,
    required this.tickets,
    required this.onOpenChat,
    required this.onNuevoTicket,
  }) : super(key: key);

  @override
  State<SoporteView> createState() => _SoporteViewState();
}

class _SoporteViewState extends State<SoporteView> {
  int _filtroSeleccionado = 0; // 0: Todos, 1: En Chat, 2: En Revisión, 3: Resueltos
  String _busqueda = '';

  @override
  Widget build(BuildContext context) {
    // Filtrado de tickets
    final ticketsFiltrados = widget.tickets.where((t) {
      if (_filtroSeleccionado == 1 && t['estatus'] != 'CHAT ACTIVO') return false;
      if (_filtroSeleccionado == 2 && t['estatus'] != 'EN REVISIÓN') return false;
      if (_filtroSeleccionado == 3 && t['estatus'] != 'RESUELTO') return false;
      if (_busqueda.isNotEmpty) {
        final q = _busqueda.toLowerCase();
        final id = (t['id'] ?? '').toString().toLowerCase();
        final asunto = (t['asunto'] ?? '').toString().toLowerCase();
        final cat = (t['categoria'] ?? '').toString().toLowerCase();
        return id.contains(q) || asunto.contains(q) || cat.contains(q);
      }
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Top App Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 14, 18, 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Centro de Soporte',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF162A60),
                            letterSpacing: -0.5,
                          ),
                        ),
                        Text(
                          'Mesa de Ayuda • Distribuidora DV 1004',
                          style: TextStyle(fontSize: 11.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      onPressed: widget.onNuevoTicket,
                      icon: const Icon(Icons.add_circle_outline, size: 16, color: Color(0xFF162A60)),
                      label: const Text('Nuevo', style: TextStyle(color: Color(0xFF162A60), fontWeight: FontWeight.w900, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFACC15),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Tarjeta de Estatus de Soporte "En Línea"
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF162A60), Color(0xFF1E3A8A)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF162A60).withOpacity(0.2),
                        blurRadius: 12,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: widget.isSupportOnline ? const Color(0xFF059669) : const Color(0xFFD97706),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    widget.isSupportOnline ? 'AGENTE EN LÍNEA' : 'FUERA DE LÍNEA',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.12),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: const [
                                  Icon(Icons.bolt_rounded, size: 14, color: Color(0xFFFACC15)),
                                  SizedBox(width: 4),
                                  Text(
                                    'Resp: < 2 min',
                                    style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Soporte Central LanAhora Activo',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Estamos conectados en vivo para validar dispersiones SPEI, solicitudes de línea y aclaraciones de cartera en tiempo real.',
                          style: TextStyle(
                            fontSize: 11.5,
                            color: Color(0xFFE2E8F0),
                            height: 1.35,
                          ),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () {
                                  final active = widget.tickets.firstWhere(
                                    (t) => t['estatus'] == 'CHAT ACTIVO',
                                    orElse: () => widget.tickets.isNotEmpty ? widget.tickets.first : {},
                                  );
                                  if (active.isNotEmpty) {
                                    widget.onOpenChat(active);
                                  } else {
                                    widget.onNuevoTicket();
                                  }
                                },
                                icon: const Icon(Icons.chat_bubble_rounded, size: 16, color: Color(0xFF162A60)),
                                label: const Text(
                                  'Chatear con Soporte en Vivo',
                                  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12.5, color: Color(0xFF162A60)),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFACC15),
                                  padding: const EdgeInsets.symmetric(vertical: 12),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Tarjeta de Horas Laborales
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: const [
                              Icon(Icons.access_time_filled_rounded, size: 18, color: Color(0xFF162A60)),
                              SizedBox(width: 6),
                              Text(
                                'Horarios de Atención Oficial',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF162A60),
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDCFCE7),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'Abierto Ahora',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                color: Color(0xFF15803D),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'Lunes a Viernes',
                                    style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    '08:00 - 19:00 hrs',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                                  ),
                                  Text(
                                    'Jornada Continua',
                                    style: TextStyle(fontSize: 9, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'Sábados',
                                    style: TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
                                  ),
                                  SizedBox(height: 2),
                                  Text(
                                    '09:00 - 14:00 hrs',
                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                                  ),
                                  Text(
                                    'Mediodía / Cierres',
                                    style: TextStyle(fontSize: 9, color: Color(0xFFD97706), fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: const [
                          Icon(Icons.location_on_outlined, size: 12, color: Color(0xFF64748B)),
                          SizedBox(width: 4),
                          Text(
                            'Zona Horaria: Saltillo / Tiempo del Centro de México (CST)',
                            style: TextStyle(fontSize: 9.5, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Coordinador Asignado
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.person_pin_rounded, color: Color(0xFF4F46E5), size: 22),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Coordinador: José Miguel González',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                            ),
                            Text(
                              'Sucursal Saltillo Victoria • Tel: 844-329-8471',
                              style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: const [
                            Icon(Icons.phone, size: 12, color: Color(0xFF15803D)),
                            SizedBox(width: 4),
                            Text('Llamar', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF15803D))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Barra de Filtros y Búsqueda
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Tus Tickets de Atención (${widget.tickets.length})',
                          style: const TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF162A60),
                          ),
                        ),
                        TextButton(
                          onPressed: widget.onNuevoTicket,
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          child: const Text(
                            '+ Levantar caso',
                            style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Color(0xFF162A60)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Pills de Filtro
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterPill(0, 'Todos (${widget.tickets.length})'),
                          const SizedBox(width: 6),
                          _buildFilterPill(1, 'En Chat Activo (${widget.tickets.where((t) => t['estatus'] == 'CHAT ACTIVO').length})'),
                          const SizedBox(width: 6),
                          _buildFilterPill(2, 'En Revisión (${widget.tickets.where((t) => t['estatus'] == 'EN REVISIÓN').length})'),
                          const SizedBox(width: 6),
                          _buildFilterPill(3, 'Resueltos (${widget.tickets.where((t) => t['estatus'] == 'RESUELTO').length})'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Lista de Tickets
            if (ticketsFiltrados.isEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Center(
                    child: Column(
                      children: const [
                        Icon(Icons.inbox_outlined, size: 42, color: Color(0xFFCBD5E1)),
                        SizedBox(height: 8),
                        Text(
                          'No hay tickets en este filtro',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final t = ticketsFiltrados[index];
                      final bool isChat = t['estatus'] == 'CHAT ACTIVO';
                      final bool isRevision = t['estatus'] == 'EN REVISIÓN';

                      Color badgeColor = const Color(0xFF64748B);
                      Color badgeBg = const Color(0xFFF1F5F9);
                      if (isChat) {
                        badgeColor = const Color(0xFF047857);
                        badgeBg = const Color(0xFFDCFCE7);
                      } else if (isRevision) {
                        badgeColor = const Color(0xFFB45309);
                        badgeBg = const Color(0xFFFEF3C7);
                      }

                      final List msgs = t['mensajes'] ?? [];
                      final lastMsg = msgs.isNotEmpty ? msgs.last['texto'] : '';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isChat ? const Color(0xFF10B981) : const Color(0xFFE2E8F0),
                            width: isChat ? 1.5 : 1,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.02),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () => widget.onOpenChat(t),
                          child: Padding(
                            padding: const EdgeInsets.all(14),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Text(
                                          t['id'] ?? '',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w900,
                                            color: Color(0xFF162A60),
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFEFF6FF),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            t['categoria'] ?? 'General',
                                            style: const TextStyle(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF1D4ED8),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: badgeBg,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          if (isChat) ...[
                                            Container(
                                              width: 6,
                                              height: 6,
                                              decoration: const BoxDecoration(
                                                color: Color(0xFF10B981),
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                            const SizedBox(width: 4),
                                          ],
                                          Text(
                                            t['estatus'] ?? 'ABIERTO',
                                            style: TextStyle(
                                              fontSize: 9.5,
                                              fontWeight: FontWeight.w900,
                                              color: badgeColor,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  t['asunto'] ?? '',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFF1E293B),
                                  ),
                                ),
                                if (lastMsg.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    lastMsg,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Color(0xFF64748B),
                                      height: 1.3,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 10),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.access_time, size: 12, color: Color(0xFF94A3B8)),
                                        const SizedBox(width: 4),
                                        Text(
                                          t['fecha'] ?? '',
                                          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                    Row(
                                      children: [
                                        if (isChat)
                                          ElevatedButton.icon(
                                            onPressed: () => widget.onOpenChat(t),
                                            icon: const Icon(Icons.chat_bubble_outline, size: 12, color: Colors.white),
                                            label: const Text('Entrar al Chat', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: const Color(0xFF162A60),
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                              minimumSize: Size.zero,
                                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          )
                                        else
                                          TextButton.icon(
                                            onPressed: () => widget.onOpenChat(t),
                                            icon: const Icon(Icons.visibility_outlined, size: 13, color: Color(0xFF162A60)),
                                            label: const Text('Ver Detalle', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF162A60))),
                                            style: TextButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              minimumSize: Size.zero,
                                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                    childCount: ticketsFiltrados.length,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterPill(int index, String label) {
    final bool isSelected = _filtroSeleccionado == index;
    return InkWell(
      onTap: () => setState(() => _filtroSeleccionado = index),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF162A60) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF162A60) : const Color(0xFFE2E8F0),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
