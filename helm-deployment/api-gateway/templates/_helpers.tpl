{{- define "gateway.name" -}}
gateway
{{- end }}

{{- define "gateway.fullname" -}}
{{ include "gateway.name" . }}-release
{{- end }}
