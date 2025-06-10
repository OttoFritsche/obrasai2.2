Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
chunk-NFC5BX5N.js?v=2f435b77:16670 Uncaught TypeError: Cannot read properties of undefined (reading 'then')
    at useAdvancedAlerts.ts:448:10
    at commitHookEffectListMount (chunk-NFC5BX5N.js?v=2f435b77:16915:34)
    at commitPassiveMountOnFiber (chunk-NFC5BX5N.js?v=2f435b77:18156:19)
    at commitPassiveMountEffects_complete (chunk-NFC5BX5N.js?v=2f435b77:18129:17)
    at commitPassiveMountEffects_begin (chunk-NFC5BX5N.js?v=2f435b77:18119:15)
    at commitPassiveMountEffects (chunk-NFC5BX5N.js?v=2f435b77:18109:11)
    at flushPassiveEffectsImpl (chunk-NFC5BX5N.js?v=2f435b77:19490:11)
    at flushPassiveEffects (chunk-NFC5BX5N.js?v=2f435b77:19447:22)
    at commitRootImpl (chunk-NFC5BX5N.js?v=2f435b77:19416:13)
    at commitRoot (chunk-NFC5BX5N.js?v=2f435b77:19277:13)
(anonymous) @ useAdvancedAlerts.ts:448
commitHookEffectListMount @ chunk-NFC5BX5N.js?v=2f435b77:16915
commitPassiveMountOnFiber @ chunk-NFC5BX5N.js?v=2f435b77:18156
commitPassiveMountEffects_complete @ chunk-NFC5BX5N.js?v=2f435b77:18129
commitPassiveMountEffects_begin @ chunk-NFC5BX5N.js?v=2f435b77:18119
commitPassiveMountEffects @ chunk-NFC5BX5N.js?v=2f435b77:18109
flushPassiveEffectsImpl @ chunk-NFC5BX5N.js?v=2f435b77:19490
flushPassiveEffects @ chunk-NFC5BX5N.js?v=2f435b77:19447
commitRootImpl @ chunk-NFC5BX5N.js?v=2f435b77:19416
commitRoot @ chunk-NFC5BX5N.js?v=2f435b77:19277
performSyncWorkOnRoot @ chunk-NFC5BX5N.js?v=2f435b77:18895
flushSyncCallbacks @ chunk-NFC5BX5N.js?v=2f435b77:9119
(anonymous) @ chunk-NFC5BX5N.js?v=2f435b77:18627Understand this error
chunk-NFC5BX5N.js?v=2f435b77:14032 The above error occurred in the <DashboardAlertasAvancados> component:

    at DashboardAlertasAvancados (http://localhost:8080/src/components/AlertasAvancados/DashboardAlertasAvancados.tsx?t=1749526052926:26:45)
    at div
    at div
    at MotionComponent (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=2f435b77:4800:40)
    at main
    at div
    at div
    at div
    at Provider (http://localhost:8080/node_modules/.vite/deps/chunk-43RB3RZG.js?v=2f435b77:38:15)
    at TooltipProvider (http://localhost:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=2f435b77:63:5)
    at http://localhost:8080/src/components/ui/sidebar.tsx:39:72
    at DashboardLayout (http://localhost:8080/src/components/layouts/DashboardLayout.tsx:133:28)
    at AlertasAvancadosPage
    at ProtectedRoute (http://localhost:8080/src/contexts/auth/ProtectedRoutes.tsx:15:34)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2f435b77:4069:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2f435b77:4508:5)
    at QueryClientProvider (http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=2f435b77:2794:3)
    at ThemeProvider (http://localhost:8080/src/providers/theme-provider.tsx:21:33)
    at App
    at AuthProvider (http://localhost:8080/src/contexts/auth/AuthContext.tsx:21:32)
    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2f435b77:4451:15)
    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=2f435b77:5196:5)

Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.
logCapturedError @ chunk-NFC5BX5N.js?v=2f435b77:14032
update.callback @ chunk-NFC5BX5N.js?v=2f435b77:14052
callCallback @ chunk-NFC5BX5N.js?v=2f435b77:11248
commitUpdateQueue @ chunk-NFC5BX5N.js?v=2f435b77:11265
commitLayoutEffectOnFiber @ chunk-NFC5BX5N.js?v=2f435b77:17093
commitLayoutMountEffects_complete @ chunk-NFC5BX5N.js?v=2f435b77:17980
commitLayoutEffects_begin @ chunk-NFC5BX5N.js?v=2f435b77:17969
commitLayoutEffects @ chunk-NFC5BX5N.js?v=2f435b77:17920
commitRootImpl @ chunk-NFC5BX5N.js?v=2f435b77:19353
commitRoot @ chunk-NFC5BX5N.js?v=2f435b77:19277
performSyncWorkOnRoot @ chunk-NFC5BX5N.js?v=2f435b77:18895
flushSyncCallbacks @ chunk-NFC5BX5N.js?v=2f435b77:9119
(anonymous) @ chunk-NFC5BX5N.js?v=2f435b77:18627Understand this error
chunk-NFC5BX5N.js?v=2f435b77:9129 Uncaught TypeError: Cannot read properties of undefined (reading 'then')
    at useAdvancedAlerts.ts:448:10
    at commitHookEffectListMount (chunk-NFC5BX5N.js?v=2f435b77:16915:34)
    at commitPassiveMountOnFiber (chunk-NFC5BX5N.js?v=2f435b77:18156:19)
    at commitPassiveMountEffects_complete (chunk-NFC5BX5N.js?v=2f435b77:18129:17)
    at commitPassiveMountEffects_begin (chunk-NFC5BX5N.js?v=2f435b77:18119:15)
    at commitPassiveMountEffects (chunk-NFC5BX5N.js?v=2f435b77:18109:11)
    at flushPassiveEffectsImpl (chunk-NFC5BX5N.js?v=2f435b77:19490:11)
    at flushPassiveEffects (chunk-NFC5BX5N.js?v=2f435b77:19447:22)
    at commitRootImpl (chunk-NFC5BX5N.js?v=2f435b77:19416:13)
    at commitRoot (chunk-NFC5BX5N.js?v=2f435b77:19277:13)
(anonymous) @ useAdvancedAlerts.ts:448
commitHookEffectListMount @ chunk-NFC5BX5N.js?v=2f435b77:16915
commitPassiveMountOnFiber @ chunk-NFC5BX5N.js?v=2f435b77:18156
commitPassiveMountEffects_complete @ chunk-NFC5BX5N.js?v=2f435b77:18129
commitPassiveMountEffects_begin @ chunk-NFC5BX5N.js?v=2f435b77:18119
commitPassiveMountEffects @ chunk-NFC5BX5N.js?v=2f435b77:18109
flushPassiveEffectsImpl @ chunk-NFC5BX5N.js?v=2f435b77:19490
flushPassiveEffects @ chunk-NFC5BX5N.js?v=2f435b77:19447
commitRootImpl @ chunk-NFC5BX5N.js?v=2f435b77:19416
commitRoot @ chunk-NFC5BX5N.js?v=2f435b77:19277
performSyncWorkOnRoot @ chunk-NFC5BX5N.js?v=2f435b77:18895
flushSyncCallbacks @ chunk-NFC5BX5N.js?v=2f435b77:9119
(anonymous) @ chunk-NFC5BX5N.js?v=2f435b77:18627Understand this error