<?php

namespace App\Support\Ruea;

final class PreguntasRuea
{
    /** @var array<string, string> */
    public const ETIQUETAS = [
        'S1_P01' => '¿Según su sistema productivo, con cuál de las siguientes opciones se identifica?',
        'S1_P02' => '¿El productor presenta actividades productivas secundarias con qué enfoque o proyección?',
        'S1_P03' => '¿Cómo es su acceso a tipo de herramientas y equipos para ser empleados en su proceso productivo?',
        'S1_P04' => '¿Cuál es su estado actual con respecto a las BPA?',
        'S1_P05' => '¿Cómo es la forma de comercialización del productor?',
        'S1_P06' => '¿A qué tipo de mercado lleva su producto?',
        'S1_P07' => '¿A qué nivel de valor agregado lleva su producto?',
        'S1_P08' => '¿Gestiona registros de su sistema productivo?',
        'S1_P09' => '¿Cómo es la vinculación de mano de obra?',
        'S1_P10' => '¿Tiene acceso a créditos?',
        'S2_P01' => '¿Está vinculado a algún tipo de organización?',
        'S2_P02' => '¿Participa en actividades productivas de manera colectiva?',
        'S2_P03' => '¿Participa el productor en procesos de emprendimiento y asociatividad?',
        'S2_P04' => '¿Participa en alianzas comerciales?',
        'S2_P05' => '¿Accede a apoyo técnico para el manejo de su sistema productivo?',
        'S2_P06' => '¿Cuenta con sellos de calidad y certificaciones?',
        'S2_P07' => '¿Qué conocimientos sobre propiedad intelectual posee?',
        'S3_P01' => '¿Qué acceso tiene a fuentes de información relacionadas con su sistema productivo?',
        'S3_P02' => '¿Qué acceso tiene a las TIC?',
        'S3_P03' => '¿Qué tanto utiliza las TIC para toma de decisiones?',
        'S3_P04' => 'Para el manejo del agronegocio, ¿qué habilidades y competencias tiene en el uso de las TIC?',
        'S3_P05' => '¿Cómo es el nivel de apropiación social del conocimiento tradicional y científico?',
        'S4_P01' => '¿Conoce y planifica en su sistema productivo, actividades de conservación de la biodiversidad y el medio ambiente?',
        'S4_P02' => '¿Conoce y planifica actividades de conservación del recurso hídrico en su sistema productivo?',
        'S4_P03' => '¿Tiene conocimiento e implementa acciones de prevención y/o recuperación del medio ambiente enfocado en la mitigación y adaptación al cambio climático?',
        'S4_P04' => '¿Conoce la normatividad ambiental?',
        'S5_P01' => '¿Tiene conocimiento sobre instancias y mecanismos de participación?',
        'S5_P02' => '¿Tiene conocimiento sobre herramientas para la participación?',
        'S5_P03' => '¿Conoce los mecanismos de control político y social? ¿Y ha participado en los mismos?',
        'S5_P04' => '¿Cuál ha sido el rol del productor en la autogestión de las comunidades?',
    ];

    /** @return list<string> */
    public static function codigos(): array
    {
        return array_keys(self::ETIQUETAS);
    }
}
