package com.example.order;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ArchitectureTest {
    @Test
    void checksRealClassesAndTheirDependencyDirection() {
        var classes = new ClassFileImporter().withImportOption(new ImportOption.DoNotIncludeTests())
                .importPackages("com.example.order");
        for (String layer : new String[]{"web", "application", "persistence", "model"}) {
            assertTrue(classes.stream().anyMatch(type -> type.getPackageName().equals("com.example.order." + layer)),
                    "Architecture rule must not pass with an empty layer: " + layer);
        }
        noClasses().that().resideInAPackage("..web..")
                .should().dependOnClassesThat().resideInAPackage("..persistence..")
                .because("WEB_NO_PERSISTENCE").check(classes);
        noClasses().that().resideInAnyPackage("..application..", "..persistence..", "..model..")
                .should().dependOnClassesThat().resideInAPackage("..web..")
                .because("INNER_NO_WEB").check(classes);
    }
}
